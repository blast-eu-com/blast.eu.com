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

import os
import json
from env import _DATAMODEL_DIR, _ESC

__DATAMODEL_NODE_TYPE_FILE = os.path.join(_DATAMODEL_DIR, 'node_os_type.template.mapping')
__INDEX_NAME = "blast_node_os_type"
__INDEX_DATA = [
    {"name": "Mac"},
    {"name": "Linux"},
    {"name": "Unix"},
    {"name": "Windows"}
]
__INDEX_TEMPLATE_DATA = json.load(open(__DATAMODEL_NODE_TYPE_FILE, "r"))

def defineIndexTemplate():

    ret = _ESC.es.indices.put_index_template(name=__INDEX_NAME, body=json.dumps(__INDEX_TEMPLATE_DATA))
    if not ret["acknowledged"]:
        raise Exception(ret)


def provisionDefault():

    for document in __INDEX_DATA:
        ret = _ESC.es.index(index=__INDEX_NAME, body=json.dumps(document))
        if not ret["result"] == "created":
            raise Exception(ret)


def main():

    try:
        defineIndexTemplate()
        provisionDefault()

    except Exception as e:
        print(e)


if __name__ == "__main__":
    main()
