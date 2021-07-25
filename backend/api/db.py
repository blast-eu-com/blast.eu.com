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
import yaml
from elasticsearch import Elasticsearch

# _CURRENT_DIR = os.path.dirname(os.path.realpath(__file__))
# _SERVER_DIR = os.path.dirname(_CURRENT_DIR)
# _SERVER_CONFIG = os.path.join(_SERVER_DIR, 'backend.yml')
_BACKEND_CONFIG = "/etc/blast.eu.com/backend.yml"
if os.path.isfile(_BACKEND_CONFIG):
    with open(_BACKEND_CONFIG, 'r') as f:
        data = yaml.load(f, Loader=yaml.FullLoader)
        ES_HOSTNAME = data["elasticsearch"]["ip"]
        ES_PORT = data["elasticsearch"]["port"]
        ES_PROTOCOL = data["elasticsearch"]["protocol"]


class ESConnector:
    def __init__(self):
        self.es = Elasticsearch([ES_HOSTNAME], port=ES_PORT, scheme=ES_PROTOCOL)

    def close(self):
        self.es.transport.close()
