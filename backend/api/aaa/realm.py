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

import re
import os
import json
from ..statistic import Statistic
from ..setting import Setting



def portmap_provision(realm):
    """ this function provision portmap for the realm passed as arg """
    server_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
    python_path = os.path.join(server_dir + '/bin/python3')
    cmd = python_path + ' ' + os.path.join(server_dir, 'builder/build_db_port_map.py') + ' ' + realm
    os.popen(cmd)
    return True


class Realm:
    def __init__(self, connector):
        self.ES = connector
        self.DB_INDEX = 'blast_realm'
        self.STATISTIC = Statistic(self.ES)
        self.STATISTIC_DATA = self.STATISTIC.STATISTIC_DATA
        self.STATISTIC_DATA["object_type"] = 'realm'

    def add(self, data: dict):
        """ this function create a new realm """
        # adding a new realm into the database
        # the data must contain several information fields like :
        print(" >>> Enter file:aaa:class:realm:function:add")
        try:
            # make sure the realm name is not empty.
            if data["name"] == '':
                raise Exception("Realm name is required. Empty is not accepted.")

            # make sure the realm name follow the correct pattern.
            realm_name_pattern = re.compile('[a-zA-Z0-9\-_]+')
            if not realm_name_pattern.fullmatch(data["name"]):
                raise Exception("Realm name is not valid. Alphanumeric characters and '_', '-', are accepted.")

            if self.list_by_name(data["name"])["hits"]["total"]["value"] > 0:
                # here is the block when the realm exists
                # make sure the realm member is not already a member of this realm
                if self.list_by_member_and_name(data["member"], data["name"])["hits"]["total"]["value"] > 0:
                    raise Exception("This member is already present in the realm.")

                # set the realm description
                # as the realm exists then the realm description is retrieved
                data["description"] = self.list_by_member_role_and_name("owner", data["name"])["hits"]["hits"][0]["_source"]["description"]

            else:
                # here is the block when the realm doesnt exists
                # as the realm not exists then the realm description is created
                data["description"] = str("The realm " + data["name"])

                # Add the realm settings before creating the realm.
                setting = Setting(self.ES)
                if not setting.add(data["name"]):
                    raise Exception("Realm setting provision failure.")

            realm = {
                "name": data["name"],
                "member": data["member"],
                "active": data["active"],
                "role": data["role"],
                "description": data["description"]
            }

            return self.ES.index(index=self.DB_INDEX, body=json.dumps(realm), refresh=True)

        except Exception as e:
            print("backend Exception, file:aaa:class:realm:func:add")
            print(str(e))
            return {"failure": str(e)}

    def delete(self, account_email: str, realm_name: str):
        """ this function delete an existing account object from the database """
        print(" >>> Enter file:aaa:class:realm:function:delete")
        try:
            print("delete realm")
            # account = Account(self.ES)
            # node = Node(self.ES)
            # cluster = Cluster(self.ES)
            # infra = Infra(self.ES)
            # setting = Setting(self.ES)
            # portmap = Portmap(self.ES)
            # realm_id = self.list_by_name(realm_name)["hits"]["hits"][0]["_id"]
            # link_account_realm = account.list_by_active_realm(realm_name)
            #
            # if link_account_realm["hits"]["total"]["value"] > 0:
            #    raise Exception("Realm cannot be deleted because some accounts use this realm as active realm")
            #
            # node.delete_by_realm({"realm": realm_name, "account_email": account_email})
            # cluster.delete_by_realm({"realm": realm_name, "account_email": account_email})
            # infra.delete_by_realm({"realm": realm_name, "account_email": account_email})
            # setting.delete_by_realm(realm_name)
            # portmap.delete_by_realm(realm_name)
            # account.delete_by_realm(realm_name)
            #
            # return self.ES.delete(index=self.DB_INDEX, id=realm_id, refresh=True)

        except Exception as e:
            print("backend Exception, file:realm:class:Realm:func:delete")
            print(str(e))
            return {"failure": str(e)}

    def update(self, realm_id: str, data: dict):
        print(" >>> Enter file:realm:class:Realm:function:update")
        try:
            return self.ES.update(index=self.DB_INDEX, id=realm_id, body=json.dumps({"doc": data}), refresh=True)

        except Exception as e:
            print("backend Exception, file:realm:class:Realm:func:update")
            print(str(e))
            return {"failure": str(e)}

    def list(self):
        """ this function returns all the realm object present in the database """
        print(" >>> Enter file:realm:class:Realm:function:list")
        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "match_all": {}
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
            return self.ES.search(index=self.DB_INDEX, body=req, _source_excludes="account_email")

        except Exception as e:
            print("backend Exception, file:realm:class:Realm:func:list")
            print(e)
            return {"failure": e}

    def list_by_uniq_name(self):
        try:
            req = json.dumps(
                {
                    "size": 0,
                    "query": {
                        "match_all": {}
                    },
                    "sort": [
                        {
                            "name": {
                                "order": "desc"
                            }
                        }
                    ],
                    "aggs": {
                        "aggregate_by_name": {
                            "terms": {
                                "field": "name"
                            }
                        }
                    }
                }
            )

            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:realm:class:Realm:func:list")
            print(e)
            return {"failure": e}

    def list_by_member(self, member: str):
        print(" >>> Enter file:realm:class:Realm:function:list_by_member")
        try:
            req = json.dumps(
                {
                    "query": {
                        "term": {
                            "member": member
                        }
                    }
                }
            )

            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:realm:class:Realm:func:list_by_member")
            print(e)
            return {"failure": e}

    def list_active_by_member(self, member: str):
        print(" >>> Enter file:realm:class:Realm:function:list_active_by_member")
        try:
            req = json.dumps(
                {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "member": member
                                    }
                                },
                                {
                                    "term": {
                                        "active": True
                                    }
                                }
                            ]
                        }
                    }
                }
            )

            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:realm:class:Realm:func:list_active_by_member")
            print(e)
            return {"failure": e}

    def list_by_id(self, id: str):
        """ this function returns the realm by realm id as passed via function param """
        print(" >>> Enter file:realm:class:Realm:function:list_by_id")
        try:
            req = json.dumps(
                {
                    "query": {
                        "term": {
                            "_id": id
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
            print("backend Exception, file:realm:class:Realm:func:list_by_id")
            print(str(e))
            return {"failure": str(e)}

    def list_by_member_role_and_name(self, role: str, realm_name: str):
        """ This function list the realm members by role which belongs to a given realm """
        print(" >>> Enter file:realm:class:Realm:function:list_by_member_role_and_name")
        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "role": role
                                    }
                                },
                                {
                                    "term": {
                                        "name": realm_name
                                    }
                                }
                            ]
                        }
                    },
                    "sort": [
                        {
                            "member": {
                                "order": "asc"
                            }
                        }
                    ]
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:realm:class:Realm:func:list_member_role_by_name")
            print(str(e))
            return {"failure": str(e)}

    def list_by_member_and_name(self, member: str, realm_name: str):
        """ This function list the realm by member which belongs to a given realm """
        print(" >>> Enter file:realm:class:Realm:function:list_by_member_and_name")
        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "member": member
                                    }
                                },
                                {
                                    "term": {
                                        "name": realm_name
                                    }
                                }
                            ]
                        }
                    }
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:realm:class:Realm:func:list_member_by_name")
            print(str(e))
            return {"failure": str(e)}

    def list_by_name(self, realm_name: str):
        """ this function returns the realm object with the given name """
        print(" >>> Enter file:realm:class:Realm:function:list_by_name")
        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "term": {
                            "name": realm_name
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
            print("backend Exception, file:realm:class:Realm:func:list_by_name")
            print(str(e))
            return {"failure": str(e)}

    def list_owner_delegate_member_by_name(self, realm: str):

        try:
            print(" >>> Enter file:realm:class:Realm:function:list_owner_delegate_by_name")
            owners = [owner["_source"]["member"] for owner in self.list_by_member_role_and_name("owner", realm)["hits"]["hits"]]
            delegates = [delegate["_source"]["member"] for delegate in self.list_by_member_and_name("delegate", realm)["hits"]["hits"]]
            return owners + delegates

        except Exception as e:
            print("backend Exception, file:realm:class:Realm:func:list_owner_delegate_by_name")
            print(str(e))
            return {"failure": str(e)}

    def switch_member_role(self, realm: str, member: str, new_role: str):
        """ This function switch the member role of a given member by a new role
        which belong to a given realm """
        print(" >>> Enter file:realm:class:Realm:function:switch_member_role")
        try:
            realm = self.list_by_member_and_name(member, realm)["hits"]["hits"][0]
            realm["_source"]["role"] = new_role
            return self.update(realm["_id"], realm["_source"])

        except Exception as e:
            print("backend Exception, file:realm:class:Realm:func:switch_member_role")
            print(str(e))
            return {"failure": str(e)}

    def switch_realm_active(self, realm: str, member: str, active: bool):
        """ This function switch the active realm by the active value passed of a given member """
        print(" >>> Enter file:realm:class:Realm:function:switch_active_realm")
        try:
            realm = self.list_by_member_and_name(member, realm)["hits"]["hits"][0]
            print(realm)
            realm["_source"]["active"] = active
            return self.update(realm["_id"], realm["_source"])

        except Exception as e:
            print("backend Exception, file:realm:class:Realm:func:switch_active_realm")
            print(str(e))
            return {"failure": str(e)}

    def is_active_realm_member(self, account_email: str, realm: str):
        """
        This function check if there is a match between the account email provided and the realm
        After the token check, an additional check is done, the account provided can only query his current active realm
        param: account_email: account email passed by the requester
        param: realm: realm name passed by requester in the REST API path """
        print(" >>> Enter file:realm:class:Realm:function:is_active_realm_member")
        try:
            realm = self.list_by_member_and_name(account_email, realm)["hits"]["hits"][0]
            return True if realm["_source"]["active"] else False

        except Exception as e:
            print("backend Exception, file:realm:class:Realm:func:is_active_realm_member")
            print(str(e))
            return {"failure": str(e)}

    def is_realm_member(self, account_email: str, realm: str):
        """ This function check if the account_email passed is a member (no role control)
        of the realm passed """
        print(" >>> Enter file:realm:class:Realm:function:is_realm_member")
        try:
            realm = self.list_by_member_and_name(account_email, realm)
            return True if realm["hits"]["total"]["value"] == 1 else False

        except Exception as e:
            print("backend Exception, file:realm:class:Realm:func:is_realm_member")
            print(str(e))
            return {"failure": str(e)}

    def is_regular_realm_member(self, account_email: str, realm: str):
        """ This function check if the account_email passed is a regular member of the realm passed """
        print(" >>> Enter file:realm:class:Realm:function:is_regular_realm_member")
        try:
            realm = self.list_by_member_and_name(account_email, realm)["hits"]["hits"][0]
            return True if realm["_source"]["role"] == "regular" else False

        except Exception as e:
            print("backend Exception, file:realm:class:Realm:func:is_regular_realm_member")
            print(str(e))
            return {"failure": str(e)}

    def is_delegate_realm_member(self, account_email: str, realm: str):
        """ This function check if the account_email passed is a delegate member of the realm passed"""
        print(" >>> Enter file:aaa:class:Account:function:is_delegate_realm_member")
        try:
            realm = self.list_by_member_and_name(account_email, realm)["hits"]["hits"][0]
            return True if realm["_source"]["role"] == "delegate" else False

        except Exception as e:
            print("backend Exception, file:realm:class:Realm:func:is_delegate_realm_member")
            print(str(e))
            return {"failure": str(e)}

    def is_owner_realm_member(self, account_email: str, realm: str):
        """ This function check if the account_email passed is the owner member of the realm passed"""
        print(" >>> Enter file:aaa:class:Account:function:is_owner_realm_member")
        try:
            realm = self.list_by_member_and_name(account_email, realm)["hits"]["hits"][0]
            return True if realm["_source"]["role"] == "owner" else False

        except Exception as e:
            print("backend Exception, file:realm:class:Realm:func:is_owner_realm_member")
            print(str(e))
            return {"failure": str(e)}