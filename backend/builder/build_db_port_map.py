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
__DATAMODEL_PORTMAP_FILE = os.path.join(_DATAMODEL_DIR, 'port_map.template.mapping')
__INDEX_NAME = "blast_port_map"
__INDEX_DATA = [
    {"port": "20", "protocol": "FTP", "realm": __REALM, "description": "File Transfer Protocol"},
    {"port": "21", "protocol": "FTP", "realm": __REALM, "description": "File Transfer Protocol"},
    {"port": "22", "protocol": "SSH", "realm": __REALM, "description": "Secure SHell"},
    {"port": "23", "protocol": "Telnet", "realm": __REALM, "description": "Telnet"},
    {"port": "25", "protocol": "SMTP", "realm": __REALM, "description": "Simple Mail Transfer Protocol"},
    {"port": "80", "protocol": "HTTP", "realm": __REALM, "description": "HyperText Transfer Protocol"},
    {"port": "123", "protocol": "NTP", "realm": __REALM, "description": "Network Time Protocol"},
    {"port": "389", "protocol": "LDAP", "realm": __REALM, "description": "Lightweight Directory Access Protocol"},
    {"port": "443", "protocol": "HTTPS", "realm": __REALM, "description": "HyperText Transfer Protocol Secure"},
    {"port": "873", "protocol": "RSYNC", "realm": __REALM, "description": "Remote SYNC"},
    {"port": "992", "protocol": "Telnets", "realm": __REALM, "description": "Telnet over TLS"},
    {"port": "993", "protocol": "IMAPS", "realm": __REALM, "description": "IMAP over TLS"},
    {"port": "995", "protocol": "POP3S", "realm": __REALM, "description": "POP3 over TLS"},
    {"port": "3306", "application": "MySQL", "realm": __REALM, "description": "MySQL database system"},
    {"port": "9200", "application": "Elasticsearch", "realm": __REALM, "description": "Elasticsearch default port"}
]
__INDEX_TEMPLATE_DATA = json.load(open(__DATAMODEL_PORTMAP_FILE, "r"))


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
