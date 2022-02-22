# -*- coding:utf-8 -*-
"""
   Copyright 2022 Jerome DE LUCCHI
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

import re
import json
import threading
import base64
import string
import random
from api import statistic
from api import scenarioManager
from api.cluster import Cluster
from api.infra import Infra
from api.node import Node


class Scenario:
    def __init__(self, connector):
        self.ES = connector
        self.DB_INDEX = 'blast_obj_scenario'
        self.STATISTIC = statistic.Statistic(self.ES)
        self.STATISTIC_DATA = self.STATISTIC.STATISTIC_DATA
        self.STATISTIC_DATA["object_type"] = 'scenario'

    def add(self, account_email: str, realm: str, scenario: dict):

        try:
            if scenario["name"] == "":
                raise Exception("Scenario name is required. Empty value is not accepted.")

            scenario_name_pattern = re.compile("[a-zA-Z0-9\-_]+")
            if not scenario_name_pattern.fullmatch(scenario["name"]):
                raise Exception("Cluster name is not valid. Alphanumeric characters and '_', '-', are accepted.")

            if len(scenario["nodes"]) == 0:
                raise Exception("Scenario nodes must not be null. Select one node at least.")

            if len(scenario["scripts"]) == 0:
                raise Exception("Scenario scripts must not be null. Select one script at least.")

            scenario["realm"] = realm
            scenario["account_email"] = account_email
            scenario_add_res = self.ES.index(index=self.DB_INDEX, body=json.dumps(scenario), refresh=True)
            if scenario_add_res["result"] != "created":
                raise Exception("Internal Error: Scenario create failure.")

            self.STATISTIC_DATA["object_action"] = 'create'
            self.STATISTIC_DATA["account_email"] = account_email
            self.STATISTIC_DATA["realm"] = realm
            self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
            self.STATISTIC_DATA["object_name"] = scenario["name"]
            self.STATISTIC.add(self.STATISTIC_DATA)

            return scenario_add_res

        except Exception as e:
            print("backend Exception, file:scenario:class:scenario:func:__add__")
            print(e)
            return {"failure": str(e)}

    def delete(self, realm: str, scenario_ids: list):

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
                                        "_id": scenario_ids
                                    }
                                }
                            ]
                        }
                    }
                }
            )
            return self.ES.delete_by_request(index=self.DB_INDEX, body=req, refresh=True)

        except Exception as e:
            print("backend Exception, file:scenario:class:scenario:func:__delete__")
            print(e)
            return {"failure": str(e)}

    def execute(self, scenario=None, scenario_realm=None, scenario_id=None):
        """
        This function execute a scenario order coming from the API

        [1]: the scenario is executed from the GUI:
        + the scenario_realm is collected from the API URL
        + the scenario_id is empty
        + the scenario is the details of the items selected by the operator

        :param scenario: A copy of object to be executed
        :param scenario_id: Id of the object to be executed
        """
        try:
            if scenario["name"] == "":
                raise Exception("Scenario name is required to execute.")

            if len(scenario["nodes"]) == 0:
                raise Exception("Scenario nodes is required to execute. Select one node at least.")

            if len(scenario["scripts"]) == 0:
                raise Exception("Scenario scripts is required to execute. Select one script at least.")

            scenario_manager = scenarioManager.ScenarioManager(self.ES)
            scenario_id = str("oneshot-" + base64.urlsafe_b64encode(''.join([random.choice(string.ascii_letters + string.digits) for n in range(16)]).encode('utf-8')).decode("utf-8"))
            execute_scenario_kwargs = {
                "scenario_realm": scenario_realm,
                "scenario": scenario,
                "scenario_id": scenario_id,
                "execution_id": str(base64.urlsafe_b64encode(''.join([random.choice(string.ascii_letters + string.digits) for n in range(16)]).encode('utf-8')).decode("utf-8"))
            }

            new_t = threading.Thread(target=scenario_manager.execute_scenario, args=(), kwargs=execute_scenario_kwargs)
            new_t.start()
            return {"success": "started"}

        except Exception as e:
            print("backend Exception, file:scenario:class:scenario:func:api_execute")
            print(e)
            return {"failure": str(e)}

    def list(self, realm: str):

        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "term": {
                            "realm": realm
                        }
                    },
                    "sort": [
                        {
                            "name": {
                                "order": "desc"
                            }
                        }
                    ]
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:scenario:class:scenario:func:__list__")
            print(e)
            return {"failure": str(e)}

    def list_by_script_id(self, realm: str, script_id: str):
        """ Returns all the scenario saved with the given script id """
        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "filter": [
                                {
                                    "term": {
                                        "realm": realm
                                    },
                                    "scripts": {
                                        "term": script_id
                                    }
                                }
                            ]
                        }
                    }
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:scenario:class:scenario:func:list_by_script_id")
            print(e)
            return {"failure": str(e)}

    def list_any_by_script_id(self, script_id: str):
        """ Returns all the scenario saved with the given script id """
        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "filter": {
                                "scripts": {
                                    "term": script_id
                                }
                            }
                        }
                    }
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:scenario:class:scenario:func:list_any_by_script_id")
            print(e)
            return {"failure": str(e)}

    def list_by_node_id(self, realm: str, node_id: str):
        """ Returns all the scenario saved with the given node id """
        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "filter": [
                                {
                                    "term": {
                                        "nodes": node_id
                                    }
                                },
                                {
                                    "term": {
                                        "realm": realm
                                    }
                                }
                            ]
                        }
                    }
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:scenario:class:scenario:func:list_by_node_id")
            print(e)
            return {"failure": str(e)}

    def list_by_id(self, realm: str, scenario_id: str):

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
                                        "_id": scenario_id
                                    }
                                }
                            ]
                        }
                    }
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:scenario:class:scenario:func:list_by_ids")
            print(e)
            return {"failure": str(e)}

    def map_id_name(self, realm: str, scenario_id: str):

        try:
            return self.list_by_id(realm, scenario_id)["hits"]["hits"][0]["_source"]["name"]

        except Exception as e:
            print(e)
            return {"failure": str(e)}

    def update(self, scenario_id: str, scenario: dict):
        pass
