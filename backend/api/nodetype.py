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
from api import db




class NodeType:
    def __init__(self):
        self.es = db.ESConnector().es
        self.DB_INDEX = 'blast_node_type'

    def add(self, nodeType: str):

        """ this function add a new node into the database """
        try:
            self.es.index(index=self.DB_INDEX, body=json.dumps({"type": nodeType}))

        except Exception as e:
            return {"failure": e}

    def delete(self, id: str):

        """ this function delete an existing node type """
        try:
            self.es.delete(index=self.DB_INDEX, id=id)

        except Exception as e:
            return {"failure": e}

    def list(self):

        """ this function returns all the node type """
        try:
            req = json.dumps({"size": 1000, "query": {"match_all": {}}})
            return self.es.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            return {"failure": e}

    def list_by_id(self, id: str):

        """ this function returns the node type object for which the id match """
        try:
            return self.es.get(index=self.DB_INDEX, id=id)

        except Exception as e:
            return {"failure": e}

    def list_by_type(self, node_type: str):

        """ this function returns the list of cluster nodes """
        try:
            return self.es.search(index=self.DB_INDEX, body='{"query":{"match":{"type":"' + node_type + '"}}}')

        except Exception as e:
            return {"failure": e}
