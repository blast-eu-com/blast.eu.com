#!../bin/python3
# -*- coding:utf-8 -*-
"""
   Copyright 2022 Jerome DE LUCCHI

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

from env import _ESC

_INDEX_NAME = [
    "blast_account",
    "blast_port_map",
    "blast_realm",
    "blast_request",
    "blast_setting",
    "blast_statistic",
    "blast_script_lang",
    "blast_obj_cluster",
    "blast_obj_infrastructure",
    "blast_obj_node",
    "blast_node_mode",
    "blast_node_type",
    "blast_node_os_type",
    "blast_obj_report",
    "blast_obj_scenario",
    "blast_obj_scheduler",
    "blast_obj_script"
]

for _name in _INDEX_NAME:
    _ESC.es.indices.delete_index_template(name=_name)
    _ESC.es.indices.delete(index=_name)