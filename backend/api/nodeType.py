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


class NodeType:
    def __init__(self, connector):
        self.ES = connector
        self.DB_INDEX = 'blast_node_type'

    def add(self, node_type: str):

        """ this function add a new node into the database """
        try:
            self.ES.index(index=self.DB_INDEX, body=json.dumps({"type": node_type}))

        except Exception as e:
            return {"failure": e}

    def delete(self, node_type_id: str):

        """ this function delete an existing node type """
        try:
            self.ES.delete(index=self.DB_INDEX, id=node_type_id)

        except Exception as e:
            return {"failure": e}

    def list(self):

        """ this function returns all the node type """
        try:
            req = json.dumps(
                {
                    "size": 1000,
                    "query": {
                        "match_all": {}
                    }
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            return {"failure": e}
