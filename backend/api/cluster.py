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
from api import statistic


class Cluster:
    def __init__(self, ESConnector):
        self.ES = ESConnector
        self.STATISTIC = statistic.Statistic(self.ES)
        self.STATISTIC_DATA = self.STATISTIC.STATISTIC_DATA
        self.STATISTIC_DATA["object_type"] = "cluster"
        self.DB_INDEX = 'blast_obj_cluster'

    def __add__(self, account_email: str, realm: str, clusters: list):
        
        """ create a new cluster """
        try:
            resp_clusters_add = []
            self.STATISTIC_DATA["object_action"] = 'create'
            self.STATISTIC_DATA["account_email"] = account_email
            self.STATISTIC_DATA["realm"] = realm
            self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
            for cluster in clusters:
                self.STATISTIC_DATA["object_name"] = cluster["name"]
                cluster["realm"] = realm
                cluster["nodes"] = []
                self.STATISTIC.__add__(self.STATISTIC_DATA)
                resp_clusters_add.append(self.ES.index(index=self.DB_INDEX, body=json.dumps(cluster), refresh=True))
            return resp_clusters_add

        except Exception as e:
            print("backend Exception, file:cluster:class:cluster:func:__add__")
            print(e)
            return {"failure": str(e)}

    def add_nodes(self, account_email: str, realm: str, cluster_id: str, nodes: list):

        """ add a node to an existing cluster """
        try:
            resp_cluster_nodes_add = []
            cluster = self.list_by_ids(realm, cluster_id.split(" "))["hits"]["hits"][0]
            self.STATISTIC_DATA["object_action"] = 'createNodeLink'
            self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
            self.STATISTIC_DATA["account_email"] = account_email
            self.STATISTIC_DATA["realm"] = realm
            for node in nodes:
                self.STATISTIC_DATA["object_name"] = [cluster["_source"]["name"], node["name"]]
                cluster["_source"]["nodes"].append(node)
                resp_cluster_nodes_add.append(self.update(cluster["_id"], cluster["_source"], self.STATISTIC_DATA))
            return resp_cluster_nodes_add

        except Exception as e:
            print("backend Exception, file:cluster:class:cluster:func:add_nodes")
            print(e)
            return {"failure": str(e)}

    def __delete__(self, account_email: str, realm: str, cluster_ids: list):

        """ delete an existing cluster """
        try:
            resp_clusters_del = []
            self.STATISTIC_DATA["object_action"] = 'delete'
            self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
            self.STATISTIC_DATA["account_email"] = account_email
            self.STATISTIC_DATA["realm"] = realm
            clusters = self.list_by_ids(realm, cluster_ids)["hits"]["hits"]
            for cluster in clusters:
                self.STATISTIC_DATA["object_name"] = cluster["_source"]["name"]
                self.STATISTIC.__add__(self.STATISTIC_DATA)
                resp_clusters_del.append(self.ES.delete(index=self.DB_INDEX, id=cluster["_id"], refresh=True))
            return resp_clusters_del

        except Exception as e:
            print("backend Exception, file:cluster:class:cluster:func:__delete__")
            print(e)
            return {"failure": str(e)}

    def delete_by_realm(self, data: dict):

        """ this function delete cluster that belong the same realm """
        clusters = self.__list__(data["realm"])
        [self.__delete__({"id": cluster["_id"], "realm": data["realm"], "account_email": data["account_email"]}) for cluster in clusters["hits"]["hits"]]

    def delete_nodes(self, account_email: str, realm: str, cluster_id: str, node_ids: list):

        """ this function remove a node from a cluster """
        try:
            resp_cluster_nodes_del = []
            cluster = self.list_by_ids(realm, cluster_id.split(" "))["hits"]["hits"][0]
            self.STATISTIC_DATA["object_action"] = 'removeNodeLink'
            self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
            self.STATISTIC_DATA["account_email"] = account_email
            self.STATISTIC_DATA["realm"] = realm
            for node_id in node_ids:
                for idx in range(0, len(cluster["_source"]["nodes"])):
                    if cluster["_source"]["nodes"][idx]["id"] == node_id:
                        self.STATISTIC_DATA["object_name"] = [cluster["_source"]["name"], cluster["_source"]["nodes"][idx]["name"]]
                        del cluster["_source"]["nodes"][idx]
                        resp_cluster_nodes_del.append(self.update(cluster["_id"], cluster["_source"], self.STATISTIC_DATA))
                        break
            return resp_cluster_nodes_del

        except Exception as e:
            print("backend Exception, file:cluster:class:cluster:func: delete_nodes")
            print(e)
            return {"failure": str(e)}

    def update(self, cluster_id: str, data: str, statistic_data: dict):

        """ this function update a cluster document by id """
        try:
            self.STATISTIC.__add__(statistic_data)
            return self.ES.update(index=self.DB_INDEX, id=cluster_id, body=json.dumps({"doc": data}), refresh=True)

        except Exception as e:
            print("backend Exception, file:cluster:class:cluster:func: update")
            print(e)
            return {"failure": str(e)}

    def __list__(self, realm: str):

        """ this function returns all cluster documents present in the cluster index for a given realm """
        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "match": {
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
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:cluster:class:cluster:func:__list__")
            print(e)
            return {"failure": str(e)}

    def list_nodes(self, realm: str, cluster_ids: list):

        """
        This function returns the nodes which belongs to a given cluster
        param: realm: the name of the realm where the realm belongs to
        param: id: the id of the cluster owning the nodes
        """
        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "_source": "nodes",
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
                                        "_id": cluster_ids
                                    }
                                }
                            ]
                        }
                    }
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:cluster:class:cluster:func:list_nodes")
            print(e)
            return {"failure": str(e)}

    def list_by_ids(self, realm: str, cluster_ids: list):
        
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
                                    "terms": {
                                        "_id": cluster_ids
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

    def list_by_names(self, realm: str, names: list):

        """ this function returns the cluster object from db where the cluster name is equal to name """
        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "filter": [
                                {
                                    "terms": {
                                        "name": names
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


