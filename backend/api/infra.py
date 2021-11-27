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


class Infra:
    def __init__(self, ESConnector):
        self.ES = ESConnector
        self.DB_INDEX = 'blast_obj_infrastructure'
        self.STATISTIC = statistic.Statistic(self.ES)
        self.STATISTIC_DATA = self.STATISTIC.STATISTIC_DATA
        self.STATISTIC_DATA["object_type"] = 'infrastructure'

    def add(self, account_email: str, realm: str, infrastructure: dict):

        """
            Add a new infrastructure in a given realm
        param: account_email: The account email of the requestor
        param: realm: The name of the realm where the new infra will be created
        param: infrastructure: object containing infra infos
        """
        try:
            # make sure the infrastructure name is not empty.
            if infrastructure["name"] == "":
                raise Exception("Infrastructure name is required. Empty value is not accepted.")

            # make sure to keep unicity of infrastructure persistent
            if self.list_by_name(realm, infrastructure["name"])["hits"]["total"]["value"] > 0:
                raise Exception("Infrastructure name already exists. Use another infrastructure name.")

            # make sure the infrastructure name pattern is respected
            infrastructure_name_pattern = re.compile('[a-zA-Z0-9\-_]+')
            if not infrastructure_name_pattern.fullmatch(infrastructure["name"]):
                raise Exception("Cluster name is not valid. Alphanumeric characters and '_', '-', are accepted.")

            infrastructure["realm"] = realm
            infrastructure["clusters"] = []
            infra_add_res = self.ES.index(index=self.DB_INDEX, body=json.dumps(infrastructure), refresh=True)
            if infra_add_res["result"] == "created":
                self.STATISTIC_DATA["object_action"] = "create"
                self.STATISTIC_DATA["account_email"] = account_email
                self.STATISTIC_DATA["realm"] = realm
                self.STATISTIC_DATA["object_name"] = infrastructure["name"]
                self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
                self.STATISTIC.add(self.STATISTIC_DATA)

            return infra_add_res

        except Exception as e:
            print("backend Exception, file:infrastructure:class:infrastructure:func:add")
            print(e)
            return {"failure": str(e)}

    def add_cluster(self, account_email: str, realm: str, infra_id: str, cluster: dict):

        """
        This function links an existing cluster into the infrastructure
        param: account_email: the account email of the requestor
        param: realm: the realm name the infrastructure belongs to
        param: infra_id: the infra_id where to add the cluster ref
        param: clusters: the list of cluster info to link to the infrastrucutre
        """
        try:
            infra = self.list_by_id(realm, infra_id)["hits"]["hits"][0]
            infra["_source"]["clusters"].append(cluster)
            infra_add_cluster_res = self.update(infra_id, infra["_source"])
            if infra_add_cluster_res["result"] == "updated":
                self.STATISTIC_DATA["object_action"] = "addClusterLink"
                self.STATISTIC_DATA["object_name"] = [infra["_source"]["name"], cluster["name"]]
                self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
                self.STATISTIC_DATA["account_email"] = account_email
                self.STATISTIC_DATA["realm"] = realm
                self.STATISTIC.add(self.STATISTIC_DATA)

            return infra_add_cluster_res

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
            self.STATISTIC.add(self.STATISTIC_DATA)
            req = json.dumps({"query": {"match": {"realm": data["realm"]}}})
            return self.ES.count(INDEX=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:infrastructure:class:infrastructure:func:count")
            print(e)
            return {"failure": str(e)}

    def delete(self, account_email: str, realm: str, infra_id: str):

        """
        This function delete one or more than one infrastructure ids from the same realm
        param: account_email: The account_email of the requestor
        param: realm: The realm name the infrastructure belongs to
        param: infra_ids: The list of infrastructures id to be deleted
        """
        try:
            infra = self.list_by_id(realm, infra_id)["hits"]["hits"][0]
            infra_del_res = self.ES.delete(index=self.DB_INDEX, id=infra["_id"], refresh=True)
            if infra_del_res["result"] == "deleted":
                self.STATISTIC_DATA["object_action"] = "delete"
                self.STATISTIC_DATA["object_name"] = infra["_source"]["name"]
                self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
                self.STATISTIC_DATA["account_email"] = account_email
                self.STATISTIC_DATA["realm"] = realm
                self.STATISTIC.add(self.STATISTIC_DATA)

            return infra_del_res

        except Exception as e:
            print("backend Exception, file:infrastructure:class:infrastructure:func:delete")
            print(e)
            return {"failure": str(e)}

    def delete_by_realm(self, data: dict):

        """ this function delete all the infrastructure that belong the realm """
        infras = self.__list__(data["realm"])
        [self.__delete__({"id": infra["_id"], "realm": data["realm"], "account_email": data["account_email"]}) for infra in infras["hits"]["hits"]]

    def delete_cluster(self, account_email: str, realm: str, infra_id: str, cluster_name: str):

        """
        This function unlinks an existing cluster from the infrastructure
        param: account_email: account of the requestor
        param: realm: realm name the infrastructure belongs to
        param: infra_id: the infrastructure id from where to remove the clusters ref
        param: cluster_ids: the cluster ids to be unlink from this infrastructure
        """
        try:
            infra = self.list_by_id(realm, infra_id)["hits"]["hits"][0]
            for idx in range(0, len(infra["_source"]["clusters"])):
                if infra["_source"]["clusters"][idx]["name"] == cluster_name:
                    self.STATISTIC_DATA["object_name"] = [infra["_source"]["name"], infra["_source"]["clusters"][idx]["name"]]
                    del infra["_source"]["clusters"][idx]
                    break

            infra_del_cluster_res = self.update(infra["_id"], infra["_source"])
            if infra_del_cluster_res["result"] == "updated":
                self.STATISTIC_DATA["object_action"] = "removeClusterLink"
                self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
                self.STATISTIC_DATA["account_email"] = account_email
                self.STATISTIC_DATA["realm"] = realm
                self.STATISTIC.add(self.STATISTIC_DATA)

            return infra_del_cluster_res

        except Exception as e:
            print("backend Exception, file:infrastructure:class:infrastructure:func:delete_cluster")
            print(e)
            return {"failure": str(e)}

    def update(self, infra_id: str, data: dict):

        try:
            return self.ES.update(index=self.DB_INDEX, id=infra_id, body=json.dumps({"doc": data}), refresh=True)

        except Exception as e:
            print("backend Exception, file:infrastructure:class:infrastructure:func:update")
            print(e)
            return {"failure": str(e)}

    def list(self, realm: str):

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
            print("backend Exception, file:infrastructure:class:infrastructure:func:list")
            print(e)
            return {"failure": str(e)}

    def list_by_id(self, realm: str, id: str):

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
                                    "term": {
                                        "_id": id
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
            print("backend Exception, file:infrastructure:class:infrastructure:func:list_by_id")
            print(e)
            return {"failure": str(e)}

    def list_by_name(self, realm: str, name: str):

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
                                    "term": {
                                        "name": name
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
            print("backend Exception, file:infrastructure:class:infrastructure:func:list_by_name")
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

