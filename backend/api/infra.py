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
from api import statistic


class Infra:
    def __init__(self, ESConnector):
        self.ES = ESConnector
        self.DB_INDEX = 'blast_obj_infrastructure'
        self.STATISTIC = statistic.Statistic(self.ES)
        self.STATISTIC_DATA = self.STATISTIC.STATISTIC_DATA
        self.STATISTIC_DATA["object_type"] = 'infrastructure'

    def __add__(self, account_email: str, realm: str, infrastructures: list):

        """
        This function add a new infrastructure
        param: account_email: The account email of the requestor
        param: realm: The name of the realm where the new infra will be created
        param: infrastructure: object containing infra infos
        """
        try:
            resp_infrastructures_add = []
            self.STATISTIC_DATA["object_action"] = "create"
            self.STATISTIC_DATA["account_email"] = account_email
            self.STATISTIC_DATA["realm"] = realm
            for infrastructure in infrastructures:
                self.STATISTIC_DATA["object_name"] = infrastructure["name"]
                self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
                self.STATISTIC.__add__(self.STATISTIC_DATA)
                infrastructure["realm"] = realm
                infrastructure["clusters"] = []
                print(infrastructure)
                resp_infrastructures_add.append(self.ES.index(index=self.DB_INDEX, body=json.dumps(infrastructure), refresh=True))
                print(resp_infrastructures_add)
            return resp_infrastructures_add

        except Exception as e:
            print("backend Exception, file:infrastructure:class:infrastructure:func:__add__")
            print(e)
            return {"failure": str(e)}

    def add_clusters(self, account_email: str, realm: str, infra_id: str, clusters: list):

        """
        This function links an existing cluster into the infrastructure
        param: account_email: the account email of the requestor
        param: realm: the realm name the infrastructure belongs to
        param: infra_id: the infra_id where to add the cluster ref
        param: clusters: the list of cluster info to link to the infrastrucutre
        """
        try:
            resp_infrastructure_cluster_add = []
            for cluster in clusters:
                infra = self.list_by_ids(realm, infra_id.split(" "))["hits"]["hits"][0]
                self.STATISTIC_DATA["object_action"] = "addClusterLink"
                self.STATISTIC_DATA["object_name"] = [infra["_source"]["name"], cluster["name"]]
                self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
                self.STATISTIC_DATA["account_email"] = account_email
                self.STATISTIC_DATA["realm"] = realm
                infra["_source"]["clusters"].append(cluster)
                resp_infrastructure_cluster_add.append(self.update(infra_id, infra["_source"], self.STATISTIC_DATA))
            return resp_infrastructure_cluster_add

        except Exception as e:
            print("backend Exception, file:infrastructure:class:infrastructure:func:add_clusters")
            print(e)
            return {"failure": str(e)}

    def count(self, data: dict):

        try:
            self.STATISTIC_DATA["object_action"] = "count"
            self.STATISTIC_DATA["object_name"] = ""
            self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
            self.STATISTIC_DATA["account_email"] = data["account_email"]
            self.STATISTIC_DATA["realm"] = data["realm"]
            self.STATISTIC.__add__(self.STATISTIC_DATA)
            req = json.dumps({"query": {"match": {"realm": data["realm"]}}})
            return self.ES.count(INDEX=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:infrastructure:class:infrastructure:func:count")
            print(e)
            return {"failure": str(e)}

    def __delete__(self, account_email: str, realm: str, infra_ids: list):

        """
        This function delete one or more than one infrastructure ids from the same realm
        param: account_email: The account_email of the requestor
        param: realm: The realm name the infrastructure belongs to
        param: infra_ids: The list of infrastructures id to be deleted
        """
        try:
            res_infrastructure_del = []
            infras = self.list_by_ids(realm, infra_ids)["hits"]["hits"]
            for infra in infras:
                self.STATISTIC_DATA["object_action"] = "delete"
                self.STATISTIC_DATA["object_name"] = infra["_source"]["name"]
                self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
                self.STATISTIC_DATA["account_email"] = account_email
                self.STATISTIC_DATA["realm"] = realm
                self.STATISTIC.__add__(self.STATISTIC_DATA)
                res_infrastructure_del.append(self.ES.delete(index=self.DB_INDEX, id=infra["_id"], refresh=True))
            return res_infrastructure_del

        except Exception as e:
            print("backend Exception, file:infrastructure:class:infrastructure:func:__delete__")
            print(e)
            return {"failure": str(e)}

    def delete_by_realm(self, data: dict):

        """ this function delete all the infrastructure that belong the realm """
        infras = self.__list__(data["realm"])
        [self.__delete__({"id": infra["_id"], "realm": data["realm"], "account_email": data["account_email"]}) for infra in infras["hits"]["hits"]]

    def delete_clusters(self, account_email: str, realm: str, infra_id: str, cluster_ids: list):

        """
        This function unlinks an existing cluster from the infrastructure
        param: account_email: account of the requestor
        param: realm: realm name the infrastructure belongs to
        param: infra_id: the infrastructure id from where to remove the clusters ref
        param: cluster_ids: the cluster ids to be unlink from this infrastructure
        """
        try:
            res_infrastructure_cluster_del = []
            infra = self.list_by_ids(realm, infra_id.split(" "))["hits"]["hits"][0]
            self.STATISTIC_DATA["object_action"] = "removeClusterLink"
            self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
            self.STATISTIC_DATA["account_email"] = account_email
            self.STATISTIC_DATA["realm"] = realm
            for cluster_id in cluster_ids:
                for idx in range(0, len(infra["_source"]["clusters"])):
                    if infra["_source"]["clusters"][idx]["id"] == cluster_id:
                        self.STATISTIC_DATA["object_name"] = [infra["_source"]["name"], infra["_source"]["clusters"][idx]["name"]]
                        del infra["_source"]["clusters"][idx]
                        res_infrastructure_cluster_del.append(self.update(infra["_id"], infra["_source"], self.STATISTIC_DATA))
                        break
            return res_infrastructure_cluster_del

        except Exception as e:
            print("backend Exception, file:infrastructure:class:infrastructure:func:delete_clusters")
            print(e)
            return {"failure": str(e)}

    def update(self, id: str, data: dict, statistic_data: dict):

        try:
            self.STATISTIC.__add__(statistic_data)
            return self.ES.update(index=self.DB_INDEX, id=id, body=json.dumps({"doc": data}), refresh=True)

        except Exception as e:
            print("backend Exception, file:infrastructure:class:infrastructure:func:update")
            print(e)
            return {"failure": str(e)}

    def __list__(self, realm: str):

        """ this function returns all the infra """
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
                                "order": "asc"
                            }
                        }
                    ]
                }
            )
            print(req)
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:infrastructure:class:infrastructure:func:__list__")
            print(e)
            return {"failure": str(e)}

    def list_by_ids(self, realm: str, ids: list):

        """ this function returns the infra by id """
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
                                        "_id": ids
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
            print("backend Exception, file:infrastructure:class:infrastructure:func:list_by_ids")
            print(e)
            return {"failure": str(e)}

    def list_by_names(self, realm: str, names: list):

        """ this function returns the infra by name """
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
                                        "name": names
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
            print("backend Exception, file:infrastructure:class:infrastructure:func:list_by_names")
            print(e)
            return {"failure": str(e)}

