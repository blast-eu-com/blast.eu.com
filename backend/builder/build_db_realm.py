#!../bin/python3
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

import os
import sys
import json
from env import _DATAMODEL_DIR, _ESC

__REALM = 'default' if len(sys.argv) == 1 else sys.argv[1]
__DATAMODEL_REALM_FILE = os.path.join(_DATAMODEL_DIR, 'realm.template.mapping')
__INDEX_NAME = "blast_realm"
__INDEX_DATA = {"name": __REALM, "description": "The default realm", "account_email": "admin@localhost.localdomain"}
__INDEX_TEMPLATE_DATA = json.load(open(__DATAMODEL_REALM_FILE, "r"))


def defineIndexTemplate():

    ret = _ESC.es.indices.put_index_template(name=__INDEX_NAME, body=json.dumps(__INDEX_TEMPLATE_DATA))
    if not ret["acknowledged"]:
        raise Exception(ret)


def provisionDefault():

    ret = _ESC.es.index(index=__INDEX_NAME, body=json.dumps(__INDEX_DATA))
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
