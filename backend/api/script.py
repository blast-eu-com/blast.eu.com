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
from api.setting import Setting, decrypt_password


class Script:

    def __init__(self, ESConnector):
        self.ES = ESConnector
        self.DB_INDEX = 'blast_obj_script'
        self.SETTING = Setting(self.ES)
        self.script_location_dir = None
        self.script_session_dir = None

    def add(self, realm: str, data: dict) -> dict:
        """
            Add a new script in a realm
        """
        try:
            file_content = data["script_file_data"].read().decode("utf-8")
            file_name = data["script_file_name"]

            # make sure we dont register duplicate
            if self.is_script(realm, data["script_name"]):
                raise Exception("Script already exists.")

            req = {
                "args": data["script_args"],
                "name": data["script_name"],
                "description": data["script_description"],
                "realm": realm,
                "filename": file_name,
                "type": data["script_type"],
                "content": file_content,
                "shareable": data["script_shareable"],
                "shareable_realms": data["script_shareable_realms"]
            }

            return self.ES.index(index=self.DB_INDEX, body=json.dumps(req), refresh=True)

        except OSError as e:
            return {"failure": e}

        except Exception as e:
            return {"failure": e}

    def delete(self, realm: str, id: str):
        """
            Delete a script by id of a realm
        """
        try:
            req = json.dumps(
                {
                    "query": {
                        "bool": {
                            "filter": [
                                {
                                    "term": {
                                        "realm": realm
                                    }
                                },
                                {
                                    "term": {
                                        "_id": id
                                    }
                                }
                            ]
                        }
                    }
                }
            )
            return self.ES.delete_by_query(index=self.DB_INDEX, body=req, refresh=True)

        except Exception as e:
            print("backend Exception, file:script:class:script:func:list")
            print(e)
            return {"failure": str(e)}

    def list(self, realm: str):
        """
            List all script of a given realm present in the db
        """
        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "term": {
                            "realm": realm
                        }
                    },
                    "sort": [
                        {
                            "name": {
                                "order": "asc"
                            }
                        }
                    ]
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:script:class:script:func:list")
            print(e)
            return {"failure": str(e)}

    def list_by_name(self, realm: str, name: str):
        """
            List a script by name of a given realm
        """
        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "filter": [
                                {
                                    "term": {
                                        "realm": realm
                                    }
                                },
                                {
                                    "term": {
                                        "name": name
                                    }
                                }
                            ]
                        }
                    }
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:script:class:script:func:list_by_name")
            print(e)
            return {"failure": str(e)}

    def list_by_id(self, realm: str, id: str):
        """
            List a script by id of a given realm
        """
        try:
            req = json.dumps({
                "query": {
                    "bool": {
                        "filter": [
                            {
                                "term": {
                                    "realm": realm
                                }
                            },
                            {
                                "term": {
                                    "_id": id
                                }
                            }
                        ]
                    }
                }
            })
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:script:class:script:func:list_by_id")
            print(e)
            return {"failure": str(e)}

    def list_by_role(self, realm: str, role: str):
        """
            List all the script by role of a given realm
        """
        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "filter": [
                                {
                                    "term": {
                                        "roles": role
                                    }
                                },
                                {
                                    "term": {
                                        "realm": realm
                                    }
                                }
                            ]
                        }
                    },
                    "sort": [
                        {
                            "name": {
                                "order": "asc"
                            }
                        }
                    ]
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print(e)
            return {"failure": str(e)}

    def map_id_name(self, realm: str, script_id: str):
        """
        This function returns a JSON object of {"id_a": "name_a", "id_b": "name_b", ... }
        """
        try:
            script = self.list_by_id(realm, script_id)["hits"]["hits"][0]
            return script["_source"]["name"]

        except Exception as e:
            print(e)
            return {"failure": str(e)}

    def is_script(self, realm: str, name: str):
        """
            Return true if the name already exist else false
        """
        try:
            return True if self.list_by_name(realm, name)['hits']['total']['value'] == 1 else False

        except Exception as e:
            print(e)
            return {"failure": str(e)}
