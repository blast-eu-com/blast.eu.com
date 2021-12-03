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
import yaml


_CURRENT_DIR = os.path.dirname(os.path.realpath(__file__))
_SERVER_DIR = os.path.dirname(_CURRENT_DIR)
_DATAMODEL_DIR = os.path.join(_SERVER_DIR, 'datamodel')
_BLAST_BACKEND_CONFIG_FILE = "/etc/blast.eu.com/backend.yml"
_BACKEND_CONFIG_DATA = yaml.load(open(_BLAST_BACKEND_CONFIG_FILE, "r"), Loader=yaml.FullLoader)


sys.path.insert(0, _SERVER_DIR)
from api import db


if _BACKEND_CONFIG_DATA["elasticsearch"]["authenticate"]:
    cmd = 'grep -wi "BLAST_ELASTIC_USER" /lib/systemd/system/backend.blast.eu.com.service | cut -f2 -d\\" | cut -f2- -d='
    os.environ["BLAST_ELASTIC_USER"] = os.popen(cmd).read().split('\n')[0]
    cmd = 'grep -wi "BLAST_ELASTIC_USER_PWD" /lib/systemd/system/backend.blast.eu.com.service | cut -f2 -d\\" | cut -f2- -d='
    os.environ["BLAST_ELASTIC_USER_PWD"] = os.popen(cmd).read().split('\n')[0]

_ESC = db.ESConnector()