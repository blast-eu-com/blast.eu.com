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
import elasticsearch
from api.infra import Infra
from api.cluster import Cluster
from api.node import Node
from api.script import Script


class ScenarioReporter:
    def __init__(self, ESConnector):
        self.ES = ESConnector
        self.DB_INDEX = 'scenario-report'
        self.INFRA = Infra(self.ES)
        self.CLUSTER = Cluster(self.ES)
        self.NODE = Node(self.ES)
        self.SCRIPT = Script(self.ES)

    def __add__(self, scenario_report: dict) -> dict:

        try:
            avg_query = json.dumps(
                {
                    "size": 1000,
                    "query": {
                        "match": {
                            "scenario_id": scenario_report["scenario_id"]
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
            scenario_report["duration"]["avg"] = avg_duration_time
            return self.ES.index(index=self.DB_INDEX, body=json.dumps(scenario_report), refresh=True)

        except Exception as e:
            return {"failure": e}

    def update(self, scenario_report_id: str, scenario_report: dict) -> dict:

        try:
            return self.ES.update(index=self.DB_INDEX, id=scenario_report_id,
                                  body=json.dumps({"doc": scenario_report}), refresh=True)

        except Exception as e:
            return {"failure": e}

    def __list__(self, realm: str):

        try:
            req = json.dumps({
                "size": 1000,
                "query": {
                    "term": {
                        "realm": realm
                    }
                },
                "sort": [{"start_at": {"order": "desc"}}]
            })
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print(e)
            return {"failure": str(e)}

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

    def list_oneshot_last_5min(self, realm):
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
                                    "range": {
                                        "start_at": {
                                            "gte": "now-60m"
                                        }
                                    }
                                },
                                {
                                    "wildcard": {
                                        "scenario_id": "oneshot-*"
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
                                    "range": {
                                        "end_at": {
                                            "gte": "now-5m"
                                        }
                                    }
                                },
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
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=query_req)

        except Exception as err:
            print(err)
            return {"failure": str(err)}

    def list_by_ids(self, realm: str, scenario_report_ids: str):

        try:
            req = json.dumps(
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
                                        "_id": scenario_report_ids
                                    }
                                }
                            ]
                        }
                    }
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            return {"failure": e}

    def list_by_script_run_id(self, realm: str, script_run_id: str):

        try:
            req = json.dumps({
                "size": 10000,
                "query": {
                    "bool": {
                        "must": [
                            {"match": {"realm": realm}},
                            {"match": {"script_run_id": script_run_id}}
                        ]
                    }
                }
            })
            return self.ES.search(index=self.DB_INDEX, body=req)

        except (elasticsearch.exceptions.ConnectionError, elasticsearch.exceptions.NotFoundError) as e:
            return {"failure": e}

    def list_by_time_range(self, realm: str, delta: str):

        try:
            req = json.dumps({
                "size": 1000,
                "query": {
                    "bool": {
                        "must": {
                            "range": {
                                "@timestamp": {
                                    "gte": "now-" + str(delta) + "h",
                                    "lte": "now"
                                }
                            }
                        },
                        "filter": {
                            "match": {
                                "realm": realm
                            }
                        }
                    }
                },
                "sort": [{"@timestamp": {"order": "desc"}}]
            })
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            return {"failure": str(e)}

    def list_by_time_and_page_range(self, realm: str, delta: str, docstart: str, docend: str):

        try:
            size = int(docend) - int(docstart)
            req = json.dumps({
                "size": size,
                "from": int(docstart),
                "query": {
                    "bool": {
                        "must": {
                            "range": {
                                "@timestamp": {
                                    "gte": "now-" + str(delta) + "h",
                                    "lte": "now"
                                }
                            }
                        },
                        "filter": {
                            "match": {
                                "realm": realm
                            }
                        }
                    }
                },
                "sort": [{"@timestamp": {"order": "desc"}}]
            })
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print(e)
            return {"failure": str(e)}

    def count_doc_by_time_range(self, realm: str, delta: str):

        return {"count": self.list_by_time_range(realm, delta)["hits"]["total"]["value"]}

    @staticmethod
    def node_subtree(node) -> dict:

        node_name = node["_source"]["name"]
        node_node = {"title": node_name, "type": "node"}

        return node_node

    def cluster_subtree(self, cluster, nodes) -> dict:

        cluster_name = cluster["_source"]["name"]
        cluster_node = {"title": cluster_name, "type": "cluster", "folder": True, "children": []}

        for clu_node in cluster["_source"]["nodes"]:
            for node in nodes["hits"]["hits"]:
                if clu_node["id"] == node["_id"]:
                    cluster_node["children"].append(self.node_subtree(node))

        return cluster_node

    def infrastructure_subtree(self, infra, clusters, nodes) -> dict:

        infra_name = infra["_source"]["name"]
        infra_node = {"title": infra_name, "type": "infrastructure", "folder": True, "children": []}

        for infra_clu in infra["_source"]["clusters"]:
            for cluster in clusters["hits"]["hits"]:
                if infra_clu["id"] == cluster["_id"]:
                    infra_node["children"].append(self.cluster_subtree(cluster, nodes))

        return infra_node

    def tree(self, realm: str) -> list:

        infras = self.INFRA.__list__(realm)
        clusters = self.CLUSTER.__list__(realm)
        nodes = self.NODE.__list__(realm)
        return [self.infrastructure_subtree(infra, clusters, nodes) for infra in infras["hits"]["hits"]]

