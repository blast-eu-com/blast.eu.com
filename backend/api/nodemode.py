# -*- coding:utf-8 -*-
"""
   Copyright 2022 Jerome DE LUCCHI

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

import json


class NodeMode:

    def __init__(self, ESConnector):
        self.ES = ESConnector
        self.DB_INDEX = 'blast_node_mode'

    def list(self):

        """ this function returns all the node mode """
        try:
            req = json.dumps({"size": 1000, "query": {"match_all": {}}})
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            return {"failure": e}
