# -*- coding:utf-8 -*-
"""
   Copyright 2021 Jerome DE LUCCHI

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
"""

import json
import elasticsearch
import threading
from api import statistic
from api import schedulerManager


class Scheduler:

    def __init__(self, connector):
        self.ES = connector
        self.STATISTIC = statistic.Statistic(self.ES)
        self.STATISTIC_DATA = self.STATISTIC.STATISTIC_DATA
        self.STATISTIC_DATA["object_type"] = "scheduler"
        self.DB_INDEX = 'blast_obj_scheduler'

    def add(self, account_email: str, realm: str, data: dict):
        """ create a new scheduler """

        try:
            data["realm"] = realm
            scheduler_add_res = self.ES.index(index=self.DB_INDEX, body=json.dumps(data), refresh=True)
            if scheduler_add_res["result"] == "created":
                self.STATISTIC_DATA["object_action"] = 'create'
                self.STATISTIC_DATA["object_name"] = data["name"]
                self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
                self.STATISTIC_DATA["account_email"] = account_email
                self.STATISTIC_DATA["realm"] = realm
                self.STATISTIC.add(self.STATISTIC_DATA)

            return scheduler_add_res

        except Exception as e:
            print("backend Error: file:scheduler:class:scheduler:function:add")
            print(e)
            return {"failure": str(e)}

    def action(self, scheduler_data: dict):

        """ update schedule action """
        try:
            resp_schedule_update = []
            schedules = self.list_by_ids(scheduler_data["realm"], scheduler_data["schedule"])["hits"]["hits"]
            for schedule in schedules:
                schedule["_source"]["status"] = scheduler_data["action"]
                resp_schedule_update.append(self.update(schedule["_id"], schedule["_source"]))
            return resp_schedule_update

        except Exception as e:
            print("backend Error: file:scheduler:class:scheduler:function:action")
            print(e)
            return {"failure": str(e)}

    def execute(self, scheduler_data: dict):

        """
        This function starts a new scheduler thread and execute the scheduler definition
        :param scheduler_data: The scheduler object containing, scheduler_id, realm, account_email
        """
        try:
            schmngr = schedulerManager.SchedulerManager(self.ES)
            schedules = self.list_by_ids(scheduler_data["realm"], scheduler_data["ids"])
            for schedule in schedules["hits"]["hits"]:
                schedule["_source"]["account_email"] = scheduler_data["account_email"]
                new_t = threading.Thread(target=schmngr.execute_schedule, args=(), kwargs=({
                    "scheduler_id": schedule["_id"],
                    "scheduler_source": schedule["_source"]
                }))
                new_t.start()
            return {'success': 'starter'}

        except Exception as e:
            print("backend Exception, file:scheduler:class:scheduler:func:execute")
            print(e)
            return {'failure': str(e)}

    def list(self, realm: str):

        """ list all the scheduler which belong to the provided realm """
        try:
            req = json.dumps({
                "size": 10000,
                "query": {
                    "term": {
                        "realm": realm
                    }
                },
                "sort": [
                    {
                        "name": {
                            "order": "asc"
                        }
                    }
                ]
            })
            return self.ES.search(index=self.DB_INDEX, body=req)

        except (elasticsearch.exceptions.ConnectionError, elasticsearch.exceptions.NotFoundError) as e:
            return {"failure": e}

    def list_all(self):

        """ list all the scheduler no matter the realm it belongs too """
        try:
            req = json.dumps({
                "size": 10000,
                "query": {
                    "match_all": {}
                },
                "sort": [
                    {
                        "name": {
                            "order": "asc"
                        }
                    }
                ]
            })
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print(e)
            return {"failure": str(e)}

    def list_by_scenario(self, realm: str, scenario_id: str):

        try:
            req = json.dumps(
                {
                    "query": {
                        "bool": {
                            "filter": [
                                {
                                    "realm": {
                                        "term": realm
                                    }
                                },
                                {
                                    "scenario_ids": {
                                        "term": scenario_id
                                    }
                                }
                            ]
                        }
                    }
                }
            )

            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print(e)
            return {"failure": str(e)}


    def list_by_ids(self, realm: str, scheduler_ids: list):

        """ list the schedule for the specific id"""
        try:
            req = json.dumps(
                {
                    "query": {
                        "bool": {
                            "filter": [
                                {
                                    "term": {
                                        "realm": realm
                                    }
                                },
                                {
                                    "terms": {
                                        "_id": scheduler_ids
                                    }
                                }
                            ]
                        }
                    },
                    "sort": [
                        {
                            "name": {
                                "order": "asc"
                            }
                        }
                    ]
                }
            )
            print(req)
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print(e)
            return {"failure": e}

    def update(self, schedule_id: str, schedule_data: dict):

        try:
            # self.STATISTIC.__add__(statistic_data)
            return self.ES.update(index=self.DB_INDEX, id=schedule_id, body=json.dumps({"doc": schedule_data}), refresh=True)

        except Exception as e:
            print(e)
            return {"failure": str(e)}
