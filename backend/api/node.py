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
from api.setting import Setting
from api.discovery import discover


class Node:
    def __init__(self, ESConnector):
        self.ES = ESConnector
        self.SETTING = Setting(self.ES)
        self.DB_INDEX = 'blast_obj_node'
        self.STATISTIC = statistic.Statistic(self.ES)
        self.STATISTIC_DATA = self.STATISTIC.STATISTIC_DATA
        self.STATISTIC_DATA["object_type"] = 'node'

    def __add__(self, account_email: str, realm: str, nodes: list):
        """ this function add a new node into the database """
        print(" >>> Enter file:node:class:Node:function:__add__")
        try:
            resp_nodes_add = []
            self.STATISTIC_DATA["object_action"] = 'create'
            self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
            self.STATISTIC_DATA["realm"] = realm
            self.STATISTIC_DATA["account_email"] = account_email
            print(nodes)
            for node in nodes:
                self.STATISTIC_DATA["object_name"] = node["name"]
                host_net_info = node["ip"] if node["scan_by_ip"] else node["name"]
                discovered_data = self.scan(realm, host_net_info)
                if "failure" not in discovered_data.keys():
                    node["ip"] = discovered_data["ip"]
                    node["role"] = discovered_data["role"]
                    node["peers"] = discovered_data["peers"]
                    node["realm"] = realm
                    self.STATISTIC.__add__(self.STATISTIC_DATA)
                    resp_nodes_add.append(self.ES.index(index=self.DB_INDEX, body=json.dumps(node), refresh=True))

                else:
                    raise Exception(discovered_data["failure"])
            return resp_nodes_add

        except Exception as e:
            print("backend Exception, file:node:class:node:func:__add__")
            print(e)
            return {"failure": str(e)}

    def __delete__(self, account_email: str, realm: str, node_ids: list):
        """ this function delete an existing node by id """
        print(" >>> Enter file:node:class:Node:function:__delete__")
        try:
            resp_nodes_del = []
            self.STATISTIC_DATA["object_action"] = 'delete'
            self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
            self.STATISTIC_DATA["account_email"] = account_email
            self.STATISTIC_DATA["realm"] = realm
            nodes = self.list_by_ids(realm, node_ids)["hits"]["hits"]
            for node in nodes:
                self.STATISTIC_DATA["object_name"] = node["_source"]["name"]
                self.STATISTIC.__add__(self.STATISTIC_DATA)
                resp_nodes_del.append(self.ES.delete(index=self.DB_INDEX, id=node["_id"], refresh=True))

        except Exception as e:
            print("backend Exception, file:node:class:node:func:__delete__")
            print(e)
            return {"failure": str(e)}

    def delete_by_realm(self, data: dict):
        """ this function delete all the node that belong the same realm """
        print(" >>> Enter file:node:class:Node:function:delete_by_realm")
        nodes = self.__list__(data["realm"])
        [self.__delete__({"id": node["_id"], "realm": data["realm"], "account_email": data["account_email"]}) for node in nodes["hits"]["hits"]]

    def update(self, id: str, data: str):
        print(" >>> Enter file:node:class:Node:function:update")
        try:
            return self.ES.update(index=self.DB_INDEX, id=id, body=json.dumps({"doc": data}), refresh=True)

        except Exception as e:
            print("backend Exception, file:node:class:node:func:update")
            print(e)
            return {"failure": e}

    def __list__(self, realm: str):
        """ this function returns all the node object present in the database """
        print(" >>> Enter file:node:class:Node:function:__list__")
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
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:node:class:node:func:__list__")
            print(e)
            return {"failure": str(e)}

    def list_by_ids(self, realm: str, node_ids: list):
        """ this function returns all the node object by id """
        print(" >>> Enter file:node:class:Node:function:list_by_ids")
        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "terms": {
                                        "_id": node_ids
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
            print("backend Exception, file:node:class:node:func:list_by_ids")
            print(e)
            return {"failure": str(e)}

    def list_by_names(self, realm: str, names: list):
        """ this function returns all the node object by name """
        print(" >>> Enter file:node:class:Node:function:list_by_names")
        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "must": [
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
            print("backend Exception, file:node:class:node:func:list_by_names")
            print(e)
            return {"failure": str(e)}

    def list_by_ip(self, realm: str, ip: str):
        """ this function returns all the node object by ip """
        print(" >>> Enter file:node:class:Node:function:list_by_ip")
        try:
            req = json.dumps({
                "size": 10000,
                "query": {
                    "bool": {
                        "must": [
                            {
                                "term": {
                                    "realm": realm
                                }
                            },
                            {
                                "term": {
                                    "ip": ip
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
            })
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:node:class:node:func:list_by_ip")
            print(e)
            return {"failure": str(e)}

    def map_id_name(self, realm: str, node_ids: list):
        """ This function returns a JSON object of {"id_a": "name_a", "id_b": "name_b", ... } """
        print(" >>> Enter file:node:class:Node:function:map_id_name")
        try:
            mapping = {}
            resp = self.list_by_ids(realm, node_ids)
            for node in resp["hits"]["hits"]:
                mapping[node["_source"]["name"]] = node["_id"]
            return mapping

        except Exception as e:
            print(e)
            return {"failure": str(e)}

    def scan(self, realm: str, name: str):
        print(" >>> Enter file:node:class:Node:function:scan")
        try:
            settings = self.SETTING.list_by_realm(realm)
            ssh_username = settings["hits"]["hits"][0]["_source"]["ssh"]["username"]
            ssh_password = self.SETTING.list_ssh_password_by_realm(realm)
            ssh_certificate = settings["hits"]["hits"][0]["_source"]["ssh"]["certificate"]
            return discover(name, realm, **{"username": ssh_username, "password": ssh_password, "certificate": ssh_certificate})

        except Exception as e:
            print("backend Exception, file:node:class:node:func:scan")
            print(e)
            return {"failure": str(e)}

    def rescan(self, data: dict):
        print(" >>> Enter file:node:class:Node:function:rescan")
        try:
            node_data = self.list_by_ids(data["realm"], data["id"].split(" "))["hits"]["hits"][0]["_source"]
            self.STATISTIC_DATA["object_action"] = 'update'
            self.STATISTIC_DATA["object_name"] = node_data["name"]
            self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
            self.STATISTIC_DATA["account_email"] = data["account_email"]
            self.STATISTIC_DATA["realm"] = node_data["realm"]
            host_net_info = node_data["ip"] if node_data["scan_by_ip"] else node_data["hostname"]
            discovered_data = self.scan(node_data["realm"], host_net_info)
            if "failure" not in discovered_data.keys():
                node_data["ip"] = discovered_data["ip"]
                node_data["role"] = discovered_data["role"]
                node_data["peers"] = discovered_data["peers"]
                self.STATISTIC.__add__(self.STATISTIC_DATA)
                return self.update(data["id"], node_data)

            else:
                raise Exception(discovered_data["failure"])

        except Exception as e:
            print("backend Exception, file:node:class:node:func:rescan")
            print(e)
            return {"failure": str(e)}
