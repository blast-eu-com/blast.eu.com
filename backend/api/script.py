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
from api import statistic
from api import scenario
from api import setting


class Script:

    def __init__(self, connector):
        self.ES = connector
        self.DB_INDEX = 'blast_obj_script'
        self.SCENARIO = scenario.Scenario(self.ES)
        self.SETTING = setting.Setting(self.ES)
        self.STATISTIC = statistic.Statistic(self.ES)
        self.STATISTIC_DATA = self.STATISTIC.STATISTIC_DATA
        self.STATISTIC_DATA["object_type"] = 'script'
        self.script_location_dir = None
        self.script_session_dir = None

    def add(self, account_email: str, realm: str, script: dict):
        """
            Add a new script in a realm
        """
        try:
            file_content = script["script_file_data"].read().decode("utf-8")
            file_name = script["script_file_name"]

            # make sure we dont register duplicate
            if self.is_script(realm, script["script_name"]):
                raise Exception("Script already exists.")

            req = {
                "args": script["script_args"],
                "name": script["script_name"],
                "description": script["script_description"],
                "realm": realm,
                "filename": file_name,
                "type": script["script_type"],
                "content": file_content,
                "shareable": script["script_shareable"],
                "shareable_realms": script["script_shareable_realms"]
            }

            script_add_res = self.ES.index(index=self.DB_INDEX, body=json.dumps(req), refresh=True)
            if script_add_res["result"] != "created":
                raise Exception("Internal Error: Script create failure.")

            self.STATISTIC_DATA["object_action"] = 'create'
            self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
            self.STATISTIC_DATA["realm"] = realm
            self.STATISTIC_DATA["account_email"] = account_email
            self.STATISTIC_DATA["object_name"] = script["script_name"]
            self.STATISTIC.add(self.STATISTIC_DATA)

            return script_add_res

        except OSError as e:
            print("backend Exception, file:script:class:script:func:add")
            print(e)
            return {"failure": str(e)}

        except Exception as e:
            print("backend Exception, file:script:class:script:func:add")
            print(e)
            return {"failure": str(e)}

    def delete(self, account_email: str, realm: str, script_id: str):
        """ Delete a script by id of a realm """

        try:

            script = self.list_by_id(realm, script_id)

            if script["hits"]["total"]["value"] != 1:
                raise Exception("Invalid script id: " + script_id)

            # dont delete a script linked to an existing scenario
            if self.SCENARIO.list_by_script_id(realm, script_id)["hits"]["total"]["value"] > 0:
                raise Exception("The script: " + script["hits"]["hits"][0]["_source"]["name"] + " is linked to one or more scenarios.")

            # dont delete a script linked to an existing scenario from another realm. because script can be shared
            if self.SCENARIO.list_any_by_script_id(script_id)["hits"]["total"]["value"] > 0:
                raise Exception("The script: " + script["hits"]["hits"][0]["_source"]["name"] + " is linked to one or more scenarios in external realm.")

            script_del_res = self.ES.delete(index=self.DB_INDEX, id=script_id, refresh=True)
            if script_del_res["result"] != "deleted":
                raise Exception("Internal Error: Script delete failure.")

            self.STATISTIC_DATA["object_action"] = 'delete'
            self.STATISTIC_DATA["timestamp"] = statistic.UTC_time()
            self.STATISTIC_DATA["account_email"] = account_email
            self.STATISTIC_DATA["realm"] = realm
            self.STATISTIC_DATA["object_name"] = script["hits"]["hits"][0]["_source"]["name"]
            self.STATISTIC.add(self.STATISTIC_DATA)

            return script_del_res

        except Exception as e:
            print("backend Exception, file:script:class:script:func:delete")
            print(e)
            return {"failure": str(e)}

    def list(self, realm: str):
        """
            List all scripts of a given realm present in the db
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
            List a script by a given realm and name
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

    def list_by_type(self, realm: str, type: str):
        """
            List scripts by given realm and type
        """
        try:
            req = json.dumps({
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
                                    "type": type
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
            })
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:script:class:script:func:list_by_type")
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

    def search_by_name(self, realm, script_name):
        """ search scripts by given realm and name using wildcard """
        try:
            req = json.dumps({
                "size": 10000,
                "query": {
                    "bool": {
                        "filter": {
                            "term": {
                                "realm": realm
                            }
                        },
                        "must": {
                            "wildcard": {
                                "name": script_name + '*'
                            }
                        }
                    }
                },
                "sort": [
                    {
                        "name": {
                            "order": "asc"
                        }
                    }
                ]
            })
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:script:class:script:func:search_by_name")
            print(e)
            return {"failure": str(e)}

    def search_by_name_and_type(self, realm: str, script_name: str, type: str):
        """ search scripts by given realm, name using wildcard and type """
        try:
            req = json.dumps({
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
                                    "type": type
                                }
                            }
                        ],
                        "must": {
                            "wildcard": {
                                "name": script_name + '*'
                            }
                        }
                    }
                },
                "sort": [
                    {
                        "name": {
                            "order": "asc"
                        }
                    }
                ]
            })
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:script:class:script:func:search_by_name_and_type")
            print(e)
            return {"failure": str(e)}

    def map_id_name(self, realm: str, script_id: str):

        try:
            return self.list_by_id(realm, script_id)["hits"]["hits"][0]["_source"]["name"]

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
