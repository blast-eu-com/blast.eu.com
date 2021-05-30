# -*- coding:utf-8 -*-
"""
   Copyright 2020 Jerome DE LUCCHI

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

class Gsearch:

    def __init__(self, ESconnector):
        self.ES = ESconnector
        self.index = 'blast_obj_*'

    def search(self, realm: str, string: str):

        try:
            query_req = json.dumps({
                "query": {
                    "bool": {
                        "must": [
                            {
                                "term": {
                                    "realm": realm
                                }
                            },
                            {
                                "bool": {
                                    "should": [
                                        {
                                            "term": {
                                                "name": string
                                            }
                                        },
                                        {
                                            "match": {
                                                "description": string
                                            }
                                        },
                                        {
                                            "term": {
                                                "_id": string
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            })
            return self.ES.search(index=self.index, body=query_req, scroll="3m")

        except Exception as e:
            print("backend Exception, file:cluster:class:cluster:func:list_by_ids")
            print(e)
            return {"failure": str(e)}