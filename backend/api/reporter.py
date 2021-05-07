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


class Reporter:

    def __init__(self, ESConnector, report_type=None):
        self.ES = ESConnector
        self.DB_INDEX = "report"
        self.report_type = report_type

    def __add__(self, report: dict):
        try:
            avg_query = json.dumps(
                {
                    "size": 1000,
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "scheduler_id": report["scheduler_id"]
                                    }
                                },
                                {
                                    "term": {
                                        "report_type": self.report_type
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
            report["duration"]["avg"] = avg_duration_time
            return self.ES.index(index=self.DB_INDEX, body=report, refresh=True)

        except Exception as e:
            print(e)
            return {"failure": str(e)}

    def update(self, report_doc_id: str, report_doc: dict):
        try:
            return self.ES.update(index=self.DB_INDEX, id=report_doc_id, body=json.dumps({"doc": report_doc}), refresh=True)

        except Exception as err:
            print(err)
            return {"failure": str(err)}

    def filter_scroll(self, realm: str, report: dict):

        try:
            if report["time"]["datetime"]["selected"]:
                filter_time_gte = report["time"]["datetime"]["start_at"]
                filter_time_lte = report["time"]["datetime"]["end_at"]

            elif report["time"]["interval"]["selected"]:
                if report["time"]["interval"]["unit"] == "minutes":
                    time_unit = "m"
                elif report["time"]["interval"]["unit"] == "hours":
                    time_unit = "h"
                elif report["time"]["interval"]["unit"] == "days":
                    time_unit = "d"
                elif report["time"]["interval"]["unit"] == "weeks":
                    time_unit = "w"
                elif report["time"]["interval"]["unit"] == "months":
                    time_unit = "M"
                else:
                    raise SystemError("no valid time unit")

                filter_time_gte = """now-""" + report["time"]["interval"]["value"] + time_unit + """/""" + time_unit
                filter_time_lte = """now/""" + time_unit

            else:
                filter_time_gte = """1970-01-01T00:00:00.000Z"""
                filter_time_lte = """now"""

            query_req = json.dumps(
                {
                    "size": 100,
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "range": {
                                        "start_at": {
                                            "gte": filter_time_gte,
                                            "lte": filter_time_lte
                                        }
                                    }
                                },
                                {
                                    "term": {
                                        report["search"][0]["field"]: report["search"][0]["string"]
                                    }
                                },
                                {
                                    "term": {
                                        "report_type": self.report_type
                                    }
                                },
                                {
                                    "term": {
                                        "realm": realm
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
                                "field": "start_at",
                                "buckets": "100"
                            }
                        }
                    }
                }
            )

            print(query_req, self.DB_INDEX)
            return self.ES.search(index=self.DB_INDEX, body=query_req, scroll="3m")

        except Exception as err:
            print(err)
            return {"failure": err}

    def filter_regexp_scroll(self, realm: str, report: dict):
        print(report)
        try:
            if report["time"]["datetime"]["selected"]:
                filter_time_gte = report["time"]["datetime"]["start_at"]
                filter_time_lte = report["time"]["datetime"]["end_at"]

            elif report["time"]["interval"]["selected"]:
                if report["time"]["interval"]["unit"] == "minutes":
                    time_unit = "m"
                elif report["time"]["interval"]["unit"] == "hours":
                    time_unit = "h"
                elif report["time"]["interval"]["unit"] == "days":
                    time_unit = "d"
                elif report["time"]["interval"]["unit"] == "weeks":
                    time_unit = "w"
                elif report["time"]["interval"]["unit"] == "months":
                    time_unit = "M"
                else:
                    raise SystemError("no valid time unit")

                filter_time_gte = """now-""" + report["time"]["interval"]["value"] + time_unit + """/""" + time_unit
                filter_time_lte = """now/""" + time_unit

            else:
                filter_time_gte = """1970-01-01T00:00:00.000Z"""
                filter_time_lte = """now"""

            query_req = json.dumps(
                {
                    "size": 100,
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "range": {
                                        "start_at": {
                                            "gte": filter_time_gte,
                                            "lte": filter_time_lte
                                        }
                                    }
                                },   
                                {
                                    "wildcard": {
                                        report["search"][0]["field"]: report["search"][0]["string"]
                                    }
                                },
                                {
                                    "term": {
                                        "report_type": self.report_type
                                    }
                                },
                                {
                                    "term": {
                                        "realm": realm
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
                            "auto_date_histogram": {
                                "field": "start_at",
                                "buckets": "100"
                            }
                        }
                    }
                }
            )

            print(query_req, self.DB_INDEX)
            return self.ES.search(index=self.DB_INDEX, body=query_req, scroll="3m")

        except Exception as err:
            print(err)
            return {"failure": err}

    def filter_list_scroll(self, realm: str, report: dict):

        try:
            if report["time"]["datetime"]["selected"]:
                filter_time_gte = report["time"]["datetime"]["start_at"]
                filter_time_lte = report["time"]["datetime"]["end_at"]

            elif report["time"]["interval"]["selected"]:
                if report["time"]["interval"]["unit"] == "minutes":
                    time_unit = "m"
                elif report["time"]["interval"]["unit"] == "hours":
                    time_unit = "h"
                elif report["time"]["interval"]["unit"] == "days":
                    time_unit = "d"
                elif report["time"]["interval"]["unit"] == "weeks":
                    time_unit = "w"
                elif report["time"]["interval"]["unit"] == "months":
                    time_unit = "M"
                else:
                    raise SystemError("no valid time unit")

                filter_time_gte = """now-""" + report["time"]["interval"]["value"] + time_unit + """/""" + time_unit
                filter_time_lte = """now/""" + time_unit

            else:
                filter_time_gte = """1970-01-01T00:00:00.000Z"""
                filter_time_lte = """now"""

            query_req = json.dumps(
                {
                    "size": 100,
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "range": {
                                        "start_at": {
                                            "gte": filter_time_gte,
                                            "lte": filter_time_lte
                                        }
                                    }
                                },
                                {
                                    "term": {
                                        "report_type": self.report_type
                                    }
                                },
                                {
                                    "term": {
                                        "realm": realm
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
                            "auto_date_histogram": {
                                "field": "start_at",
                                "buckets": "100"
                            }
                        }
                    }
                }
            )

            print(query_req, self.DB_INDEX)
            return self.ES.search(index=self.DB_INDEX, body=query_req, scroll="3m")

        except Exception as err:
            print(err)
            return {"failure": err}

    def filter_scroll_data(self, realm: str, scroll_id: str):

        try:
            return self.ES.scroll(scroll_id=scroll_id, scroll="3m")

        except Exception as err:
            print(err)
            return {"failure": err}
