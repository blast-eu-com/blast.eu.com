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
from env import _SERVER_DIR
sys.path.insert(0, _SERVER_DIR)
from api import db

__REALM = 'default'
__DATAMODEL_DIR = os.path.join(os.path.abspath('..'), 'datamodel')
__DATAMODEL_REALM_FILE = os.path.join(__DATAMODEL_DIR, 'script_lang.template.mapping')
__ES_ADDR = db.ES_PROTOCOL + """://""" + str(db.ES_HOSTNAME) + """:""" + str(db.ES_PORT)
__SCRIPTLANG = [
    {"name": "Ansible", "picture": "Ansible.svg"},
    {"name": "Bash", "picture": "Bash.svg"},
    {"name": "Julia", "picture": "Julia.svg"},
    {"name": "Perl", "picture": "Perl.svg"},
    {"name": "Python", "picture": "Python.svg"},
    {"name": "Ruby", "picture": "Ruby.svg"}
]

__CREATE_INDEX_TEMPLATE = """curl -s -XPUT -H \"Content-Type: Application/Json\" """ + __ES_ADDR + """/_template/blast_script_lang -d@""" + __DATAMODEL_REALM_FILE


def defineIndexTemplate():

    try:
        if json.load(os.popen(__CREATE_INDEX_TEMPLATE))["acknowledged"]:
            return True
    except KeyError:
        return False


def provisionDefault():

    try:
        for lang in __SCRIPTLANG:
            __ES_PROVISION_DEFAULT = """curl -s -XPOST -H \"Content-Type: Application/Json\" """ + __ES_ADDR + """/blast_script_lang/_doc -d \'""" + json.dumps(lang) + """\'"""
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
