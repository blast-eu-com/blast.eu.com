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
from pwd import getpwnam
from env import _SERVER_DIR
sys.path.insert(0, _SERVER_DIR)
from api import db
from cryptography.fernet import Fernet


__REALM = 'default' if len(sys.argv) == 1 else sys.argv[1]
__SESSION_LOCATION = os.path.join(_SERVER_DIR, 'session')
__DATAMODEL_DIR = os.path.join(_SERVER_DIR, 'datamodel')
__DATAMODEL_SETTING_FILE = os.path.join(__DATAMODEL_DIR, 'setting.template.mapping')
__CRYPTO = Fernet.generate_key().decode('utf-8')
__ES_ADDR = db.ES_PROTOCOL + """://""" + str(db.ES_HOSTNAME) + """:""" + str(db.ES_PORT)
__SSH_LOCATION = '/tmp/blast'


if not os.path.isdir(__SESSION_LOCATION):
    os.makedirs(__SESSION_LOCATION)
    uid = getpwnam('jay').pw_uid
    gid = getpwnam('jay').pw_gid
    os.chown(__SESSION_LOCATION, uid, gid)


__CREATE_INDEX_TEMPLATE = """curl -s -XPUT -H \"Content-Type: Application/Json\" """ + __ES_ADDR + """/_template/setting -d@""" + __DATAMODEL_SETTING_FILE
__ES_PROVISION_DEFAULT = """curl -s -XPOST -H \"Content-Type: Application/Json\" """ + __ES_ADDR + """/setting/_doc -d '{
    "ansible": {
        "username" : "",
        "password" : "",
        "certificate" : "",
        "inventory" : {
            "location" : \"""" + __SESSION_LOCATION + """\"
        }
    },
    "ssh": {    
        "username" : "",
        "password" : "",
        "certificate" : "",
        "location": \"""" + __SSH_LOCATION + """\"
    },
    "crypto": \"""" + __CRYPTO + """\",
    "realm": \"""" + __REALM + """\"
}'"""

def defineIndexTemplate():

    return True if json.load(os.popen(__CREATE_INDEX_TEMPLATE))["acknowledged"] else False


def provisionDefault():

    return True if json.load(os.popen(__ES_PROVISION_DEFAULT))["result"] == "created" else False


def main():

    if defineIndexTemplate():
        if provisionDefault():
            sys.exit(0)


if __name__ == "__main__":
    main()
