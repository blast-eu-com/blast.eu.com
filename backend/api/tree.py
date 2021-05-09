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

from api.infra import Infra
from api.cluster import Cluster
from api.node import Node


def node_subtree(node) -> dict:

    node_name = node["_source"]["name"]
    node_node = {"title": node_name, "type": "node"}

    return node_node


def cluster_subtree(cluster, nodes) -> dict:

    cluster_name = cluster["_source"]["name"]
    cluster_node = {"title": cluster_name, "type": "cluster", "folder": True, "children": []}

    for clu_node in cluster["_source"]["nodes"]:
        for node in nodes["hits"]["hits"]:
            if clu_node["id"] == node["_id"]:
                cluster_node["children"].append(node_subtree(node))

    return cluster_node


def infrastructure_subtree(infra, clusters, nodes) -> dict:

    infra_name = infra["_source"]["name"]
    infra_node = {"title": infra_name, "type": "infrastructure", "folder": True, "children": []}

    for infra_clu in infra["_source"]["clusters"]:
        for cluster in clusters["hits"]["hits"]:
            if infra_clu["id"] == cluster["_id"]:
                infra_node["children"].append(cluster_subtree(cluster, nodes))

    return infra_node


def realm_infrastructure_tree(ESConnector, realm: str) -> list:

    infrastructures = Infra(ESConnector).__list__(realm)
    clusters = Cluster(ESConnector).__list__(realm)
    nodes = Node(ESConnector).__list__(realm)
    return [infrastructure_subtree(infra, clusters, nodes) for infra in infrastructures["hits"]["hits"]]

