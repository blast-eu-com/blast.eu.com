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
from env import _SERVER_DIR
sys.path.insert(0, _SERVER_DIR)
import json
from api import db

__REALM = 'default' if len(sys.argv) == 1 else sys.argv[1]
__DATAMODEL_DIR = os.path.join(_SERVER_DIR, 'datamodel')
__DATAMODEL_PORTMAP_FILE = os.path.join(__DATAMODEL_DIR, 'port_map.template.mapping')
__ES_ADDR = str(db.ES_PROTOCOL) + """://""" + str(db.ES_HOSTNAME) + """:""" + str(db.ES_PORT)
__PORTMAP_MAPPING = [
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
    {"port": "992", "protocol": "Telnets", "realm": __REALM, "description": "Telnet over TLS/SSL"},
    {"port": "993", "protocol": "IMAPS", "realm": __REALM, "description": "IMAP over TLS"},
    {"port": "995", "protocol": "POP3S", "realm": __REALM, "description": "POP3 over TLS"},
    {"port": "3306", "application": "MySQL", "realm": __REALM, "description": "MySQL database system"},
    {"port": "9200", "application": "Elasticsearch", "realm": __REALM, "description": "Elasticsearch default port"}
]
__CREATE_INDEX_TEMPLATE = """curl -s -XPUT -H \"Content-Type: Application/Json\" """ + __ES_ADDR + """/_template/blast_port_map -d@""" + __DATAMODEL_PORTMAP_FILE


def defineIndexTemplate():

    try:
        if json.load(os.popen(__CREATE_INDEX_TEMPLATE))["acknowledged"]:
            return True
    except KeyError:
        return False


def provisionDefault():

    try:
        for portmap in __PORTMAP_MAPPING:
            __ES_PROVISION_DEFAULT = """curl -s -XPOST -H \"Content-Type: Application/Json\" """ + __ES_ADDR + """/blast_port_map/_doc -d \'""" + json.dumps(portmap) + """\'"""
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
