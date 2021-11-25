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
from pwd import getpwnam
from env import _SERVER_DIR, _DATAMODEL_DIR, _ESC
from cryptography.fernet import Fernet


__SESSION_USER = "blast"
__SESSION_GRP = "blast"
__REALM = 'default' if len(sys.argv) == 1 else sys.argv[1]
__SESSION_LOCATION = os.path.join(_SERVER_DIR, 'session')
__DATAMODEL_SETTING_FILE = os.path.join(_DATAMODEL_DIR, 'setting.template.mapping')
__CRYPTO = Fernet.generate_key().decode('utf-8')
__SSH_LOCATION = '/tmp/blast'
__INDEX_NAME = "blast_setting"
__INDEX_DATA = {
    "ansible": {
        "username": "",
        "password": "",
        "certificate": "",
        "is_password_set": False,
        "inventory": {
            "location": __SESSION_LOCATION
        }
    },
    "ssh": {
        "username": "",
        "password": "",
        "certificate": "",
        "is_password_set": False,
        "location": __SSH_LOCATION
    },
    "crypto": __CRYPTO,
    "realm": __REALM
}
__INDEX_TEMPLATE_DATA = json.load(open(__DATAMODEL_SETTING_FILE, "r"))


if not os.path.isdir(__SESSION_LOCATION):
    os.makedirs(__SESSION_LOCATION)
    uid = getpwnam(__SESSION_USER).pw_uid
    gid = getpwnam(__SESSION_GRP).pw_gid
    os.chown(__SESSION_LOCATION, uid, gid)


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
