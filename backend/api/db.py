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
import re
import sys
import yaml
from cryptography.fernet import Fernet
from elasticsearch import Elasticsearch


_BACKEND_CONFIG = "/etc/blast.eu.com/backend.yml"
_BACKEND_KEYSTORE = os.path.join(os.path.dirname(os.path.dirname(os.path.realpath(__file__))), '.keystore')


def recover_secure_auth_info():
    try:
        with open(_BACKEND_KEYSTORE, 'r') as f:
            h = bytes(f.readline(), 'UTF-8')

        FERNET = Fernet(h)
        return os.environ['BLAST_ELASTIC_USER'], FERNET.decrypt(bytes(os.environ['BLAST_ELASTIC_USER_PWD'], 'UTF-8')).decode('UTF-8')

    except FileNotFoundError as e:
        sys.exit(e)


class ESConnector:
    def __init__(self):

        try:
            with open(_BACKEND_CONFIG, 'r') as f:
                data = yaml.load(f, Loader=yaml.FullLoader)
                self.ES_HOSTNAME = data["elasticsearch"]["ip"]
                self.ES_PORT = data["elasticsearch"]["port"]
                self.ES_PROTOCOL = data["elasticsearch"]["protocol"]
                self.ES_AUTHENTICATE = data["elasticsearch"]["authenticate"]

            if re.fullmatch(r'http', self.ES_PROTOCOL, re.IGNORECASE):
                if self.ES_AUTHENTICATE:
                    self.ES_USER, self.ES_USER_PWD = recover_secure_auth_info()
                    self.es = Elasticsearch([self.ES_HOSTNAME], port=self.ES_PORT, http_auth=(self.ES_USER, self.ES_USER_PWD), scheme=self.ES_PROTOCOL)
                else:
                    self.es = Elasticsearch([self.ES_HOSTNAME], port=self.ES_PORT, scheme=self.ES_PROTOCOL)

        except FileNotFoundError as e:
            sys.exit(e)

    def close(self):
        self.es.transport.close()
