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
import base64
import random
import string
from env import _DATAMODEL_DIR, _ESC
from passlib.hash import pbkdf2_sha512

__REALM = 'default'
__DATAMODEL_ACCOUNT_FILE = os.path.join(_DATAMODEL_DIR, 'account.template.mapping')
__SECRET = base64.urlsafe_b64encode(''.join([random.choice(string.ascii_letters + string.digits) for n in range(256)]).encode('utf-8')).decode("utf-8")
__INDEX_NAME = "blast_account"
__INDEX_DATA = [
    {
        "first_name": "admin",
        "family_name": "",
        "alias": "",
        "picture": "profile-picture.png",
        "email": "admin@localhost.localdomain",
        "password": pbkdf2_sha512.hash("admin"),
        "secret": __SECRET,
        "realm": [
            {
                "name": __REALM,
                "active": True
            }
        ]
    },
    {
        "first_name": "scheduler",
        "family_name": "",
        "alias": "",
        "picture": "profile-picture.png",
        "email": "scheduler@localhost.localdomain",
        "password": pbkdf2_sha512.hash("scheduler"),
        "secret": __SECRET,
        "realm": [
            {
                "name": __REALM,
                "active": True
            }
        ]
    }
]
__INDEX_TEMPLATE_DATA = json.load(open(__DATAMODEL_ACCOUNT_FILE, "r"))


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
