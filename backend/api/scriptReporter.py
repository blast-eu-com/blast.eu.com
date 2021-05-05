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

class ScriptReporter:

    def __init__(self, ESConnector):
        self.ES = ESConnector
        self.DB_INDEX = 'script-report'

    def __add__(self, script_report: dict):

        try:
            avg_query = json.dumps(
                {
                    "size": 1000,
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "match": {
                                        "script_id": script_report["script_id"]
                                    }
                                },
                                {
                                    "terms": {
                                        "node_id": script_report["node_id"]
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
            script_report["duration"]["avg"] = avg_duration_time
            return self.ES.index(index=self.DB_INDEX, body=json.dumps(script_report), refresh=True)

        except Exception as e:
            print(e)
            return {"failure": str(e)}

    def count_by_range(self, realm: str, range_start_at: str, range_end_at: str):

        try:
            query_req = json.dumps(
                {
                    "size": 1000,
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "range": {
                                        "@timestamp": {
                                            "gte": range_start_at,
                                            "lte": range_end_at
                                        }
                                    }
                                },
                                {
                                    "match": {
                                        "realm": realm
                                    }
                                }
                            ]
                        }
                    },
                    "sort": [{"@timestamp": {"order": "desc"}}]
                }
            )
            return self.ES.count(index=self.DB_INDEX, body=query_req)

        except Exception as err:
            print(err)
            return {"failure": str(err)}

    def list(self, realm: str):

        try:
            query_req = json.dumps(
                {
                    "query": {
                        "term": {
                            "realm": realm
                        }
                    },
                    "sort": [
                        {
                            "@timestamp": {
                                "order": "desc"
                            }
                        }
                    ]
                }
            )
            self.ES.search(index=self.DB_INDEX, body=query_req)

        except Exception as err:
            print(err)
            return {"failure": str(err)}

    def list_by_ids(self, realm: str, script_report_ids: list):

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
                                        "_id": script_report_ids
                                    }
                                }
                            ]
                        }
                    },
                    "sort": [
                        {
                            "@timestamp": {
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

    def list_by_range(self, realm: str, range_start_at: str, range_end_at: str):
        try:
            query_req = json.dumps(
                {
                    "size": 1000,
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "range": {
                                        "@timestamp": {
                                            "gte": range_start_at,
                                            "lte": range_end_at
                                        }
                                    }
                                },
                                {
                                    "match": {
                                        "realm": realm
                                    }
                                }
                            ]
                        }
                    },
                    "sort": [{"@timestamp": {"order": "desc"}}]
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=query_req)

        except Exception as err:
            print(err)
            return {"failure": str(err)}

    def update(self, script_report_id: str, script_report: dict):

        try:
            return self.ES.update(index=self.DB_INDEX, id=script_report_id, body=json.dumps({"doc": script_report}), refresh=True)

        except Exception as e:
            print(e)
            return {"failure": str(e)}