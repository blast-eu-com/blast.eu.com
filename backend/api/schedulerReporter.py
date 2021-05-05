# -*- coding:utf-8 -*-
"""
   Copyright 2020 Jerome DE LUCCHI

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


class SchedulerReporter:

    def __init__(self, ESConnector):
        self.ES = ESConnector
        self.DB_INDEX = 'scheduler-report'

    def __add__(self, scheduler_report: dict):
        try:
            avg_query = json.dumps(
                {
                    "size": 1000,
                    "query": {
                        "match": {
                            "scheduler_id": scheduler_report["scheduler_id"]
                        }
                    },
                    "sort": [
                        {
                            "start_at": {
                                "order": "desc"
                            }
                        }
                    ],
                    "aggs": {
                        "average": {
                            "nested": {
                                "path": "duration"
                            },
                            "aggs": {
                                "duration": {
                                    "avg": {
                                        "field": "duration.time"
                                    }
                                }
                            }
                        }
                    }
                }
            )
            avg_query_res = self.ES.search(index=self.DB_INDEX, body=avg_query)
            avg_duration_time = avg_query_res["aggregations"]["average"]["duration"]["value"] \
                if avg_query_res["aggregations"]["average"]["duration"]["value"] is not None else 0
            scheduler_report["duration"]["avg"] = avg_duration_time
            return self.ES.index(index=self.DB_INDEX, body=scheduler_report, refresh=True)

        except Exception as e:
            print(e)
            return {"failure": str(e)}

    def update(self, scheduler_doc_id: str, scheduler_doc: dict):
        try:
            return self.ES.update(index=self.DB_INDEX, id=scheduler_doc_id, body=json.dumps({"doc": scheduler_doc}), refresh=True)

        except Exception as err:
            print(err)
            return {"failure": str(err)}

    def __list__(self):
        try:
            req = json.dumps({
                "query": {
                    "match_all": {}
                },
                "sort": [
                    {
                        "start_at": {
                            "order": "asc"
                        }
                    }
                ]
            })

            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as err:
            print(err)
            return {"failure": str(err)}

    def list_by_status(self, realm: str, status: list):
        try:
            query_req = json.dumps(
                {
                    "size": 5000,
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "match": {
                                        "realm": realm
                                    }
                                },
                                {
                                    "terms": {
                                        "status": status
                                    }
                                }
                            ]
                        }
                    },
                    "sort": [
                        {
                            "start_at": {
                                "order": "desc"
                            }
                        }
                    ]
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=query_req)

        except Exception as err:
            print(err)
            return {"failure": str(err)}

    def list_last_5min(self, realm):

        try:

            query_req = json.dumps(
                {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "match": {
                                        "realm": realm
                                    }
                                },
                                {
                                    "terms": {
                                        "status": ["Ended"]
                                    }
                                },
                                {
                                    "range": {
                                        "end_at": {
                                            "gte": "now-5m"
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    "sort": [
                        {
                            "start_at": {
                                "order": "desc"
                            }
                        }
                    ],
                    "aggs": {
                        "time": {
                            "date_histogram": {
                                "field": "end_at",
                                "fixed_interval": "5s"
                            }
                        }
                    }
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=query_req)

        except Exception as err:
            print(err)
            return {"failure": str(err)}