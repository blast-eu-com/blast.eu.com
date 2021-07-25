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

import json

class Gsearch:

    def __init__(self, ESconnector):
        self.ES = ESconnector
        self.index = 'blast_obj_*'

    def search(self, realm: str, string: str):

        try:
            query_req = json.dumps({
                "size": 100,
                "query": {
                    "bool": {
                        "filter": [
                            {
                                "term": {
                                    "realm": realm
                                }
                            },
                            {
                                "bool": {
                                    "should": [
                                        {
                                            "wildcard": {
                                                "name": string
                                            }
                                        },
                                        {
                                            "wildcard": {
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
            print(query_req)
            return self.ES.search(index=self.index, body=query_req, scroll="15m")

        except Exception as e:
            print("backend Exception, file:gsearch:class:gsearch:func:search")
            print(e)
            return {"failure": str(e)}

    def search_scroll(self, realm: str, scroll_id: str):

        try:
            return self.ES.scroll(scroll_id=scroll_id, scroll="15m")

        except Exception as err:
            print(err)
            return {"failure": err}

