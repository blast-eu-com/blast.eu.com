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
import threading
import base64
import string
import random
from api import statistic
from api import scenarioManager
from api.cluster import Cluster
from api.infra import Infra
from api.node import Node


class Scenario:
    def __init__(self, ESConnector):
        self.ES = ESConnector
        self.DB_INDEX = 'blast_obj_scenario'
        self.STATISTIC = statistic.Statistic(self.ES)
        self.STATISTIC_DATA = self.STATISTIC.STATISTIC_DATA
        self.STATISTIC_DATA["object_type"] = 'scenario'

    def __add__(self, account_email: str, realm: str, scenarios: list):

        try:
            resp_scenario_add = []
            self.STATISTIC_DATA["object_action"] = 'create'
            self.STATISTIC_DATA["account_email"] = account_email
            self.STATISTIC_DATA["realm"] = realm
            print(scenarios)
            for scenario in scenarios:
                self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
                self.STATISTIC_DATA["object_name"] = scenario["name"]
                self.STATISTIC.__add__(self.STATISTIC_DATA)
                scenario["realm"] = realm
                scenario["account_email"] = account_email
                resp_scenario_add.append(self.ES.index(index=self.DB_INDEX, body=json.dumps(scenario), refresh=True))
            return resp_scenario_add

        except Exception as e:
            print("backend Exception, file:scenario:class:scenario:func:__add__")
            print(e)
            return {"failure": str(e)}

    def __delete__(self, realm: str, scenario_ids: list):

        try:
            req = json.dumps(
                {
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
                                        "_id": scenario_ids
                                    }
                                }
                            ]
                        }
                    }
                }
            )
            return self.ES.delete_by_request(index=self.DB_INDEX, body=req, refresh=True)

        except Exception as e:
            print("backend Exception, file:scenario:class:scenario:func:__delete__")
            print(e)
            return {"failure": str(e)}

    def execute(self, scenario=None, scenario_realm=None, scenario_id=None):
        """
        This function execute a scenario order coming from the API

        [1]: the scenario is executed from the GUI:
        + the scenario_realm is collected from the API URL
        + the scenario_id is empty
        + the scenario is the details of the items selected by the operator

        :param scenario: A copy of object to be executed
        :param scenario_id: Id of the object to be executed
        """
        try:
            scenario_manager = scenarioManager.ScenarioManager(self.ES)
            scenario_id = str("oneshot-" + base64.urlsafe_b64encode(''.join([random.choice(string.ascii_letters + string.digits) for n in range(16)]).encode('utf-8')).decode("utf-8"))
            execute_scenario_kwargs = {
                "scenario_realm": scenario_realm,
                "scenario": scenario,
                "scenario_id": scenario_id,
                "execution_id": str(base64.urlsafe_b64encode(''.join([random.choice(string.ascii_letters + string.digits) for n in range(16)]).encode('utf-8')).decode("utf-8"))
            }

            new_t = threading.Thread(target=scenario_manager.execute_scenario, args=(), kwargs=execute_scenario_kwargs)
            new_t.start()
            return {"success": "started"}

        except Exception as e:
            print("backend Exception, file:scenario:class:scenario:func:api_execute")
            print(e)
            return {"failure": str(e)}

    def __list__(self, realm: str):

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
                                "order": "desc"
                            }
                        }
                    ]
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:scenario:class:scenario:func:__list__")
            print(e)
            return {"failure": str(e)}

    def list_by_ids(self, realm: str, scenario_ids: list):

        try:
            req = json.dumps(
                {
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
                                        "_id": scenario_ids
                                    }
                                }
                            ]
                        }
                    }
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:scenario:class:scenario:func: list_by_ids")
            print(e)
            return {"failure": str(e)}

    def map_id_name(self, realm: str, scenario_ids: list):
        """
        This function receives a list of scenario ids, it returns an object mapping scenario ids with scenario names
        :param scenario_ids: A list of scenario ids to be sorted
        """
        try:
            mapping = {}
            resp = self.list_by_ids(realm, scenario_ids)
            for sce in resp["hits"]["hits"]:
                mapping[sce["_source"]["name"]] = sce["_id"]
            return mapping

        except Exception as e:
            print(e)
            return {"failure": str(e)}

    def update(self, scenario_id: str, scenario: dict):
        pass

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

        INFRA = Infra(self.ES)
        CLUSTER = Cluster(self.ES)
        NODE = Node(self.ES)
        infras = INFRA.__list__(realm)
        clusters = CLUSTER.__list__(realm)
        nodes = NODE.__list__(realm)
        return [self.infrastructure_subtree(infra, clusters, nodes) for infra in infras["hits"]["hits"]]