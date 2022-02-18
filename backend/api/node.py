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
import socket
from api import statistic
from api import cluster
from api import scenario
from api.setting import Setting
from api.discovery import discover


class Node:
    def __init__(self, connector):
        self.ES = connector
        self.SETTING = Setting(self.ES)
        self.DB_INDEX = 'blast_obj_node'
        self.CLUSTER = cluster.Cluster(self.ES)
        self.SCENARIO = scenario.Scenario(self.ES)
        self.STATISTIC = statistic.Statistic(self.ES)
        self.STATISTIC_DATA = self.STATISTIC.STATISTIC_DATA
        self.STATISTIC_DATA["object_type"] = 'node'

    def add(self, account_email: str, realm: str, node: dict):
        """
            Add a new node in a given realm
        """
        print(" >>> Enter file:node:class:Node:function:add")
        try:
            # make sure node name and node ip are not empty.
            if node["name"] == "" and node["ip"] == "":
                raise Exception("Node name and Node IP are required. Empty value are not accepted.")

            # make sure the ip is a valid IPv4 or IPv6 address.
            ipv46_pattern = re.compile('(\.?[0-9]{1,3}){4}|(:?[0-9a-zA-Z]{,4}){,8}')
            if not ipv46_pattern.fullmatch(node["ip"]):
                raise Exception("Node IP is not a valid IPv4/IPv6 address.")

            # make sure reference data are useful
            loopback_pattern = re.compile('127(.[0-9]{1,3}){3}|(0{0,4}:{1,2}){1,7}(0{0,3}1)')
            if node["scan_by_ip"]:
                host_net_info = node["ip_reference"] = node["ip"]
                if loopback_pattern.fullmatch(node["ip"]):
                    raise Exception("Node IP should not be a loopback address.")
            else:
                host_net_info = node["name"]
                resolve_hostname = socket.gethostbyname(node["name"])
                if loopback_pattern.fullmatch(resolve_hostname):
                    raise Exception("Node name should not be a loopback alias.")

            discovered_data = self.scan(realm, host_net_info)
            if "failure" in discovered_data.keys():
                raise Exception(discovered_data["failure"])

            node["ip"] = discovered_data["ip"]
            node["roles"] = discovered_data["roles"]
            node["peers"] = discovered_data["peers"]
            node["realm"] = realm
            node["mode"] = "running"

            node_add_res = self.ES.index(index=self.DB_INDEX, body=json.dumps(node), refresh=True)
            if not node_add_res["result"] == "created":
                raise Exception("Node creation error: " + node_add_res)

            self.STATISTIC_DATA["object_action"] = 'create'
            self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
            self.STATISTIC_DATA["realm"] = realm
            self.STATISTIC_DATA["account_email"] = account_email
            self.STATISTIC_DATA["object_name"] = node["name"]
            self.STATISTIC.add(self.STATISTIC_DATA)

            if node["cluster"] != '':
                node_data = {"name": node["name"], "id": node_add_res["_id"]}
                add_clu_node_res = self.CLUSTER.add_node(account_email, realm, node["cluster"], node_data)
                if not add_clu_node_res["result"] == "updated":
                    raise Exception("Node cluster link error: " + add_clu_node_res)

            return node_add_res

        except (socket.gaierror, socket.herror):
            print("backend Exception, file:node:class:node:func:add")
            return {"failure": "Node name resolution failure, the node name maybe not correct."}

        except Exception as e:
            print("backend Exception, file:node:class:node:func:add")
            print(e)
            return {"failure": str(e)}

    def delete(self, account_email: str, realm: str, node_id: str):
        """ this function delete an existing node by id """
        print(" >>> Enter file:node:class:Node:function:delete")
        try:
            node = self.list_by_id(realm, node_id)

            if node["hits"]["total"]["value"] != 1:
                raise Exception("Invalid node id: " + node_id)

            # dont delete a node linked to a cluster
            if self.CLUSTER.list_by_node_id(realm, node_id)["hits"]["total"]["value"] > 0:
                raise Exception("The node: " + node["hits"]["hits"][0]["_source"]["name"] + " is linked to one or more clusters")

            # dont delete a node linked to a scenario
            if self.SCENARIO.list_by_node_id(realm, node_id)["hits"]["total"]["value"] > 0:
                raise Exception("The node: " + node["hits"]["hits"][0]["_source"]["name"] + "is linked to one or more scenarios")

            node_del_res = self.ES.delete(index=self.DB_INDEX, id=node_id, refresh=True)
            if node_del_res["result"] == "deleted":
                self.STATISTIC_DATA["object_action"] = 'delete'
                self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
                self.STATISTIC_DATA["account_email"] = account_email
                self.STATISTIC_DATA["realm"] = realm
                self.STATISTIC_DATA["object_name"] = node["hits"]["hits"][0]["_source"]["name"]
                self.STATISTIC.add(self.STATISTIC_DATA)

            return node_del_res

        except Exception as e:
            print("backend Exception, file:node:class:node:func:delete")
            print(e)
            return {"failure": str(e)}

    def delete_by_realm(self, data: dict):
        """ this function delete all the node that belong the same realm """
        print(" >>> Enter file:node:class:Node:function:delete_by_realm")
        nodes = self.list(data["realm"])
        [self.delete(data["account_email"], data["realm"], node["_id"]) for node in nodes["hits"]["hits"]]

    def update(self, node_id: str, data: dict):
        print(" >>> Enter file:node:class:Node:function:update")
        try:
            return self.ES.update(index=self.DB_INDEX, id=node_id, body=json.dumps({"doc": data}), refresh=True)

        except Exception as e:
            print("backend Exception, file:node:class:node:func:update")
            print(e)
            return {"failure": e}

    def list(self, realm: str):
        """ this function returns all the node object present in the database """
        print(" >>> Enter file:node:class:Node:function:list")
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
            print("backend Exception, file:node:class:node:func:list")
            print(e)
            return {"failure": str(e)}

    def list_by_id(self, realm: str, node_id: str):
        """ this function returns all the node object by id """
        print(" >>> Enter file:node:class:Node:function:list_by_id")
        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "filter": [
                                {
                                    "term": {
                                        "_id": node_id
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
            print("backend Exception, file:node:class:node:func:list_by_id")
            print(e)
            return {"failure": str(e)}

    def list_by_name(self, realm: str, name: str):
        """ this function returns all the node object by name """
        print(" >>> Enter file:node:class:Node:function:list_by_name")
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
            print("backend Exception, file:node:class:node:func:list_by_name")
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
                        "filter": [
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

    def map_id_name(self, realm: str, node_id: str):
        """ This function returns a JSON object of {"id_a": "name_a", "id_b": "name_b", ... } """
        print(" >>> Enter file:node:class:Node:function:map_id_name")
        try:
            node = self.list_by_id(realm, node_id)["hits"]["hits"][0]
            return node["_source"]["name"]

        except Exception as e:
            print(e)
            return {"failure": str(e)}

    def scan(self, realm: str, name: str):
        print(" >>> Enter file:node:class:Node:function:scan")
        try:
            settings = self.SETTING.list_by_realm(realm)
            ssh_username = settings["hits"]["hits"][0]["_source"]["ssh"]["username"]
            ssh_password = self.SETTING.list_ssh_password_by_realm(realm)
            ssh_certificate = self.SETTING.list_ssh_certificate_by_realm(realm)
            return discover(name, realm, **{"username": ssh_username, "password": ssh_password, "certificate": ssh_certificate})

        except Exception as e:
            print("backend Exception, file:node:class:node:func:scan")
            print(e)
            return {"failure": str(e)}

    def rescan(self, data: dict):
        print(" >>> Enter file:node:class:Node:function:rescan")
        try:
            node_data = self.list_by_id(data["realm"], data["id"])["hits"]["hits"][0]["_source"]
            self.STATISTIC_DATA["object_action"] = 'update'
            self.STATISTIC_DATA["object_name"] = node_data["name"]
            self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
            self.STATISTIC_DATA["account_email"] = data["account_email"]
            self.STATISTIC_DATA["realm"] = node_data["realm"]
            host_net_info = node_data["ip_reference"] if node_data["scan_by_ip"] else node_data["name"]
            discovered_data = self.scan(node_data["realm"], host_net_info)
            if "failure" not in discovered_data.keys():
                node_data["ip"] = discovered_data["ip"]
                node_data["roles"] = discovered_data["roles"]
                node_data["peers"] = discovered_data["peers"]
                self.STATISTIC.add(self.STATISTIC_DATA)
                return self.update(data["id"], node_data)

            else:
                raise Exception(discovered_data["failure"])

        except Exception as e:
            print("backend Exception, file:node:class:node:func:rescan")
            print(e)
            return {"failure": str(e)}

    def is_running(self, realm: str, node_id: str):
        print(" >>> Enter file:node:class:Node:function:is_running")
        try:
            resp = self.list_by_id(realm, node_id)
            return True if resp["hits"]["hits"][0]["_source"]["mode"] == "running" else False
            
        except Exception as e:
            print("backend Exception, file:node:class:node:func:is_running")
            print(e)
            return {"failure": str(e)}

