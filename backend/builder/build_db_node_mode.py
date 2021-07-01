#!../bin/python3
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

import os
import sys
import json
from env import _SERVER_DIR
sys.path.insert(0, _SERVER_DIR)
from api import db

__DATAMODEL_DIR = os.path.join(os.path.abspath('..'), 'datamodel')
__DATAMODEL_NODE_MODE_FILE = os.path.join(__DATAMODEL_DIR, 'node_mode.template.mapping')
__ES_ADDR = db.ES_PROTOCOL + """://""" + str(db.ES_HOSTNAME) + """:""" + str(db.ES_PORT)
__CREATE_INDEX_TEMPLATE = """curl -s -XPUT -H \"Content-Type: Application/Json\" """ + __ES_ADDR + """/_template/blast_node_mode -d@""" + __DATAMODEL_NODE_MODE_FILE
__NODE_MODES = [
    {"mode": "Maintenance"},
    {"mode": "Pause"},
    {"mode": "Running"}
]

def defineIndexTemplate():

    try:
        if json.load(os.popen(__CREATE_INDEX_TEMPLATE))["acknowledged"]:
            return True
    except KeyError:
        return False


def provisionDefault():

    try:
        for mode in __NODE_MODES:
            __ES_PROVISION_DEFAULT = """curl -s -XPOST -H \"Content-Type: Application/Json\" """ + __ES_ADDR + """/blast_node_mode/_doc -d \'""" + json.dumps(mode) + """\'"""
            if not json.load(os.popen(__ES_PROVISION_DEFAULT))["result"] == "created":
                return False
        return True
    except KeyError:
        return False


def main():

    if defineIndexTemplate():
        if provisionDefault():
            sys.exit(0)


if __name__ == "__main__":
    main()
