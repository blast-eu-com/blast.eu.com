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
import os
import elasticsearch
from api.setting import Setting, decrypt_password


class Script:

    def __init__(self, ESConnector):
        self.ES = ESConnector
        self.DB_INDEX = 'blast_obj_script'
        self.SETTING = Setting(self.ES)
        self.script_location_dir = None
        self.script_session_dir = None

    def __add__(self, realm: str, data: dict) -> dict:

        """ this function add a new playbook as new entry """
        file_content = data["script_file_data"].read().decode("utf-8")
        file_name = data["script_file_name"]
        try:
            if not self.is_script(realm, [data["script_name"]]):

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
            return {"failure": "scriptAlreadyExists"}

        except OSError as e:
            return {"failure": e}

        except elasticsearch.exceptions.ConnectionError as e:
            return {"failure": e}

    def __delete__(self, realm: str, ids: list):

        """ this function removes a list of scripts """
        try:
            # delete first the file representation on local drive of a script
            resp = self.list_by_ids(realm, ids)
            [remove_script_file(os.path.join(scr["_source"]["location"], scr["_source"]["filename"])) for scr in resp["hits"]["hits"]]

            # delete the script from elasticsearch
            req = json.dumps(
                {
                    "query": {
                        "terms": {
                            "_id": ids
                        }
                    }
                }
            )
            return self.ES.delete_by_query(index=self.DB_INDEX, body=req, refresh=True)

        except elasticsearch.exceptions.ConnectionError as e:
            return {"failure": e}

    def __list__(self, realm: str):

        """ this function returns all the ansible playbook """
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

        except (elasticsearch.exceptions.ConnectionError, elasticsearch.exceptions.NotFoundError) as e:
            return {"failure": e}

    def list_by_names(self, realm: str, names: list):

        """ this function returns the ansible playbook with name as name """
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
                                    "terms": {
                                        "name": names
                                    }
                                }
                            ]
                        }
                    }
                }
            )
            print(req)
            return self.ES.search(index=self.DB_INDEX, body=req)

        except (elasticsearch.exceptions.ConnectionError, elasticsearch.exceptions.NotFoundError) as e:
            return {"failure": e}

    def list_by_ids(self, realm: str, ids: list):

        """ this function returns the script for the given id """
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
                                "terms": {
                                    "_id": ids
                                }
                            }
                        ]
                    }
                }
            })
            return self.ES.search(index=self.DB_INDEX, body=req)

        except elasticsearch.exceptions.ConnectionError as e:
            return {"failure": e}

    def list_by_roles(self, realm: str, roles: list):

        """ this function returns the script for the given roles and realm """
        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "filter": [
                                {
                                    "terms": {
                                        "roles": roles
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

        except (elasticsearch.exceptions.ConnectionError, elasticsearch.exceptions.NotFoundError) as e:
            return {"failure": e}

    def map_id_name(self, realm: str, script_ids: list):
        """
        This function returns a JSON object of {"id_a": "name_a", "id_b": "name_b", ... }
        """
        try:
            mapping = {}
            resp = self.list_by_ids(realm, script_ids)
            for script in resp["hits"]["hits"]:
                mapping[script["_source"]["name"]] = script["_id"]
            return mapping

        except Exception as e:
            print(e)
            return {"failure": str(e)}

    def is_script(self, realm: str, names: list):

        """ this function returns true if the name already exist else false """
        try:
            ap = self.list_by_names(realm, names)
            return True if ap['hits']['total']['value'] == 1 else False

        except elasticsearch.exceptions.ConnectionError as e:
            return {"failure": e}
