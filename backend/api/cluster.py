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

import re
import json
from api import statistic
from api import infra


class Cluster:
    def __init__(self, connector):
        self.ES = connector
        self.STATISTIC = statistic.Statistic(self.ES)
        self.INFRA = infra.Infra(self.ES)
        self.STATISTIC_DATA = self.STATISTIC.STATISTIC_DATA
        self.STATISTIC_DATA["object_type"] = "cluster"
        self.DB_INDEX = 'blast_obj_cluster'

    def add(self, account_email: str, realm: str, cluster: dict):
        """ Add a new cluster in a given realm """

        try:
            # make sure the cluster name is not empty.
            if cluster["name"] == "":
                raise Exception("Cluster name is required. Empty value is not accepted.")

            # make sure to keep the unicity of the cluster persistent.
            if self.list_by_name(realm, cluster["name"])["hits"]["total"]["value"] > 0:
                raise Exception("Cluster name already exists. User another cluster name.")

            # make sure the cluster name pattern is respected.
            cluster_name_pattern = re.compile('[a-zA-Z0-9\-_]+')
            if not cluster_name_pattern.fullmatch(cluster["name"]):
                raise Exception("Cluster name is not valid. Alphanumeric characters and '_', '-', are accepted.")

            cluster["realm"] = realm
            cluster["nodes"] = []
            cluster_add_res = self.ES.index(index=self.DB_INDEX, body=json.dumps(cluster), refresh=True)
            if cluster_add_res["result"] != "created":
                raise Exception("Internal Error: Cluster create failure.")

            self.STATISTIC_DATA["object_action"] = 'create'
            self.STATISTIC_DATA["account_email"] = account_email
            self.STATISTIC_DATA["realm"] = realm
            self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
            self.STATISTIC_DATA["object_name"] = cluster["name"]
            self.STATISTIC.add(self.STATISTIC_DATA)

            return cluster_add_res

        except Exception as e:
            print("backend Exception, file:cluster:class:cluster:func:add")
            print(e)
            return {"failure": str(e)}

    def add_node(self, account_email: str, realm: str, cluster_id: str, node: dict):
        """ add a node to an existing cluster """

        try:
            cluster = self.list_by_id(realm, cluster_id)

            if cluster["hits"]["total"]["value"] != 1:
                raise Exception("Invalid cluster id: " + cluster_id)

            cluster["hits"]["hits"][0]["_source"]["nodes"].append(node)
            cluster_update_res = self.update(cluster["hits"]["hits"][0]["_id"], cluster["hits"]["hits"][0]["_source"])
            if cluster_update_res["result"] != "updated":
                raise Exception("Internal Error: Cluster add node failure.")

            self.STATISTIC_DATA["object_action"] = 'createNodeLink'
            self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
            self.STATISTIC_DATA["account_email"] = account_email
            self.STATISTIC_DATA["realm"] = realm
            self.STATISTIC_DATA["object_name"] = [cluster["hits"]["hits"][0]["_source"]["name"], node["name"]]
            self.STATISTIC.add(self.STATISTIC_DATA)

            return cluster_update_res

        except Exception as e:
            print("backend Exception, file:cluster:class:cluster:func:add_nodes")
            print(e)
            return {"failure": str(e)}

    def delete(self, account_email: str, realm: str, cluster_id: str):
        """ delete an existing cluster """

        try:

            cluster_query_res = self.list_by_id(realm, cluster_id)

            if cluster_query_res["hits"]["total"]["value"] != 1:
                raise Exception("Invalid cluster id: " + cluster_id)

            # dont delete a cluster linked to an infrastructure
            if self.INFRA.list_by_cluster_id(realm, cluster_id)["hits"]["total"]["value"] > 0:
                raise Exception("This cluster is still linked to an infra")

            cluster_del_res = self.ES.delete(index=self.DB_INDEX, id=cluster_id, refresh=True)
            if cluster_del_res["result"] != "deleted":
                raise Exception("Internal Error: Cluster delete failure.")

            self.STATISTIC_DATA["object_action"] = 'delete'
            self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
            self.STATISTIC_DATA["account_email"] = account_email
            self.STATISTIC_DATA["realm"] = realm
            self.STATISTIC_DATA["object_name"] = cluster_query_res["hits"]["hits"][0]["_source"]["name"]
            self.STATISTIC.add(self.STATISTIC_DATA)

            return cluster_del_res

        except Exception as e:
            print("backend Exception, file:cluster:class:cluster:func:__delete__")
            print(e)
            return {"failure": str(e)}

    def delete_by_realm(self, data: dict):
        """ this function delete cluster that belong the same realm """

        clusters = self.list(data["realm"])
        [self.delete(data["account_email"], data["realm"], cluster["_id"]) for cluster in clusters["hits"]["hits"]]

    def delete_node(self, account_email: str, realm: str, cluster_id: str, node_name: str):
        """ this function remove a node from a cluster """

        try:
            cluster = self.list_by_id(realm, cluster_id)

            if cluster["hits"]["total"]["value"] != 1:
                raise Exception("Invalid cluster id: " + cluster_id)

            for idx in range(0, len(cluster["hits"]["hits"][0]["_source"]["nodes"])):
                if cluster["hits"]["hits"][0]["_source"]["nodes"][idx]["name"] == node_name:
                    self.STATISTIC_DATA["object_name"] = [cluster["hits"]["hits"][0]["_source"]["name"], cluster["hits"]["hits"][0]["_source"]["nodes"][idx]["name"]]
                    del cluster["hits"]["hits"][0]["_source"]["nodes"][idx]
                    break

            cluster_del_node_res = self.update(cluster["hits"]["hits"][0]["_id"], cluster["hits"]["hits"][0]["_source"])
            if cluster_del_node_res["result"] != "updated":
                raise Exception("Internal Error: Cluster delete node failure.")

            self.STATISTIC_DATA["object_action"] = 'removeNodeLink'
            self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
            self.STATISTIC_DATA["account_email"] = account_email
            self.STATISTIC_DATA["realm"] = realm
            self.STATISTIC.add(self.STATISTIC_DATA)

            return cluster_del_node_res

        except Exception as e:
            print("backend Exception, file:cluster:class:cluster:func: delete_nodes")
            print(e)
            return {"failure": str(e)}

    def update(self, cluster_id: str, data: str):
        """ this function update a cluster document by id """

        return self.ES.update(index=self.DB_INDEX, id=cluster_id, body=json.dumps({"doc": data}), refresh=True)

    def list(self, realm: str):
        """ this function returns all cluster documents present in the cluster index for a given realm """

        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "filter": {
                                "term": {
                                    "realm": realm
                                }
                            }
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
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:cluster:class:cluster:func:__list__")
            print(e)
            return {"failure": str(e)}

    def list_by_id(self, realm: str, cluster_id: str):
        """ this function returns the _source content of the doc with _id equal to CLU_ID """

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
                                    }
                                },
                                {
                                    "term": {
                                        "_id": cluster_id
                                    }
                                }
                            ]
                        }
                    }
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:cluster:class:cluster:func:list_by_ids")
            print(e)
            return {"failure": str(e)}

    def list_by_node_id(self, realm: str, node_id: str):
        """ return the list of clusters for a given node id """

        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "filter": [
                                {
                                    "nested": {
                                        "path": "nodes",
                                        "query": {
                                            "bool": {
                                                "must": {
                                                    "term": {
                                                        "nodes.id": node_id
                                                    }
                                                }
                                            }
                                        }
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
            print("backend Exception, file:cluster:class:cluster:func:list_by_node_id")
            print(e)
            return {"failure": str(e)}

    def list_by_name(self, realm: str, name: str):
        """ this function returns the cluster object from db where the cluster name is equal to name """

        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "filter": [
                                {
                                    "term": {
                                        "name": name
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
                            "name": {
                                "order": "asc"
                            }
                        }
                    ]
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:cluster:class:cluster:func:list_by_names")
            print(e)
            return {"failure": str(e)}


