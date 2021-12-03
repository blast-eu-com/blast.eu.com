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

import re
import os
import jwt
import json
import string
import random
import base64
import datetime
from passlib.hash import pbkdf2_sha512
from api import node
from api import cluster
from api import infra
from api.scriptlang import Scriptlang
from api.setting import Setting, Portmap


SECRET = base64.urlsafe_b64encode(''.join([random.choice(string.ascii_letters + string.digits) for n in range(256)]).encode('utf-8')).decode("utf-8")


def add_profile_picture(path, content):
    """ this function add a picture """
    rem_profile_picture(path)
    f = open(path, 'wb')
    f.write(content)
    f.close()


def rem_profile_picture(path):
    """ this function remove a picture"""
    if os.path.isfile(path):
        os.remove(path)


def encrypt_password(password):
    """ this function returns an encrypted password """
    return pbkdf2_sha512.hash(password)


def portmap_provision(realm):
    """ this function provision portmap for the realm passed as arg """
    server_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
    python_path = os.path.join(server_dir + '/bin/python3')
    cmd = python_path + ' ' + os.path.join(server_dir, 'builder/build_db_portmap.py') + ' ' + realm
    os.popen(cmd)
    return True


class Realm:
    def __init__(self, ESConnector):
        self.ES = ESConnector
        self.DB_INDEX = 'blast_realm'
        self.ACCOUNT = Account(self.ES)
        self.CLUSTER = cluster.Cluster(self.ES)
        self.INFRA = infra.Infra(self.ES)
        self.NODE = node.Node(self.ES)
        self.PORTMAP = Portmap(self.ES)
        self.SETTING = Setting(self.ES)

    def add(self, account_email: str, realm: dict):
        """ this function create a new realm """
        # adding a new realm into the database
        # the data must contain several information fields like :
        # name, description and settings
        # the realm settings will be impacting the user
        print(" >>> Enter file:aaa:class:realm:function:add")
        try:
            # make sure the realm name is not empty.
            if realm["name"] == '':
                raise Exception("Realm name is required. Empty is not accepted.")

            # make sure the realm name follow the correct pattern.
            realm_name_pattern = re.compile('[a-zA-Z0-9\-_]+')
            if not realm_name_pattern.fullmatch(realm["name"]):
                raise Exception("Cluster name is not valid. Alphanumeric characters and '_', '-', are accepted.")

            # make sure the realm name is not already used. no duplicate
            if not self.list_by_name(realm["name"])["hits"]["total"]["value"] == 0:
                raise Exception("Realm name is already used.")

            realm["account_email"] = account_email
            new_realm = self.ES.index(index=self.DB_INDEX, body=json.dumps(realm), refresh=True)

            # create the setting object if the realm is successfully created
            # get the account details to add the new realm in it
            if not new_realm["result"] == "created":
                raise Exception("Realm creation internal error.")

            if not self.SETTING.add(realm["name"]):
                raise Exception("Realm settings add failure.")

            acc = self.ACCOUNT.list_by_email(account_email)["hits"]["hits"][0]
            acc["_source"]["realm"].append({"name": realm["name"], "active": False})
            account_update = self.ACCOUNT.update(acc["_id"], acc["_source"])

            # create the portmap table for the new realm if the account is successfully updated
            # return the realm creation output
            if not account_update["result"] == "updated":
                raise Exception("Realm portmap add failure.")

            portmap_provision(realm["name"])
            return new_realm

        except Exception as e:
            print("backend Exception, file:aaa:class:realm:func:add")
            print(str(e))
            return {"failure": str(e)}

    def delete(self, account_email: str, realm_name: str):
        """ this function delete an existing account object from the database """
        print(" >>> Enter file:aaa:class:realm:function:delete")
        try:
            realm_id = self.list_by_name(realm_name)["hits"]["hits"][0]["_id"]
            link_account_realm = self.ACCOUNT.list_by_active_realm(realm_name)

            if link_account_realm["hits"]["total"]["value"] > 0:
                raise Exception("Realm cannot be deleted because some accounts use this realm as active realm")

            self.NODE.delete_by_realm({"realm": realm_name, "account_email": account_email})
            self.CLUSTER.delete_by_realm({"realm": realm_name, "account_email": account_email})
            self.INFRA.delete_by_realm({"realm": realm_name, "account_email": account_email})
            self.SETTING.delete_by_realm(realm_name)
            self.PORTMAP.delete_by_realm(realm_name)
            self.ACCOUNT.delete_by_realm(realm_name)

            return self.ES.delete(index=self.DB_INDEX, id=realm_id, refresh=True)

        except Exception as e:
            print("backend Exception, file:aaa:class:realm:func:delete")
            print(str(e))
            return {"failure": str(e)}

    def update(self, data: dict):
        print(" >>> Enter file:aaa:class:realm:function:update")
        try:
            id = data["id"]
            del data["id"]
            return self.ES.update(index=self.DB_INDEX, id=id, body=json.dumps({"doc": data}), refresh=True)

        except Exception as e:
            print("backend Exception, file:aaa:class:realm:func:update")
            print(str(e))
            return {"failure": str(e)}

    def is_realm_owner(self, account_email: str, realm: str):
        """
            This function checks if the given account_email is the owner of the given realm.
            If the account_email is defined as the owner then True is returned else False.
        """
        print(" >>> Enter file:aaa:class:Account:function:is_realm_owner")
        try:
            realm = self.list_by_name(realm)
            return True if realm["hits"]["hits"][0]["_source"]["account_email"] == account_email else False

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:is_realm_owner")
            print(str(e))
            return {"failure": str(e)}

    def list(self):
        """ this function returns all the realm object present in the database """
        print(" >>> Enter file:aaa:class:realm:function:list")
        try:
            req = json.dumps(
                {
                    "size": 1000,
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
            print("backend Exception, file:aaa:class:realm:func:list")
            print(e)
            return {"failure": e}

    def list_by_id(self, id: str):
        """ this function returns the realm by realm id as passed via function param """
        print(" >>> Enter file:aaa:class:realm:function:list_by_id")
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
            print("backend Exception, file:aaa:class:realm:func:list_by_id")
            print(str(e))
            return {"failure": str(e)}

    def list_by_name(self, name: str):
        """ this function returns the realm object with the given name """
        print(" >>> Enter file:aaa:class:realm:function:list_by_name")
        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "term": {
                            "name": name
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
            return self.ES.search(index=self.DB_INDEX, body=req, _source_excludes="account_email")

        except Exception as e:
            print("backend Exception, file:aaa:class:realm:func:list_by_name")
            print(str(e))
            return {"failure": str(e)}

    def list_by_name_full(self, name: str):
        """ this function returns the realm object with the given name """
        print(" >>> Enter file:aaa:class:realm:function:list_all_by_name")
        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "term": {
                            "name": name
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
            print("backend Exception, file:aaa:class:realm:func:list_all_by_name")
            print(str(e))
            return {"failure": str(e)}

class Account:

    def __init__(self, ESConnector):
        self.ES = ESConnector
        self.DB_INDEX = 'blast_account'
        self.SETTING = Setting(self.ES)

    def activate_realm(self, account_email: str, new_realm: str):
        """
        This function switches account realm to a new realm
        param: account_email: the account email of the account that order the realm switch
        param: new_realm: the new active realm is the new_realm
        """
        print(" >>> Enter file:aaa:class:Account:function:activate_realm")
        try:
            acc = self.list_to_login(account_email)["hits"]["hits"][0]

            for rlm in acc["_source"]["realm"]:
                rlm["active"] = True if rlm["name"] == new_realm else False

            account_activate_realm_res = self.update(acc["_id"], acc["_source"])
            return account_activate_realm_res

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:active_realm")
            print(str(e))
            return {"failure": str(e)}

    def add_account(self, data: dict):
        """ Add a new account from given data, email, password and realm """
        print(" >>> Enter file:aaa:class:Account:function:add_account")

        try:
            # Create a new realm with every new user.
            # Except if the user accept to be part of the default realm
            if data["realm"] != "default":
                rlm = Realm(self.ES)
                rlm_desc = str("The realm " + data["realm"])
                rlm.add(data["email"], {"name": data["realm"], "description": rlm_desc})

            req = json.dumps(
                {
                    "email": data["email"],
                    "password": encrypt_password(data["password"]),
                    "picture": "profile-picture.png",
                    "secret": SECRET,
                    "realm": [
                        {
                            "name": data["realm"],
                            "active": True
                        }
                    ]
                }
            )

            account_add_res = self.ES.index(index=self.DB_INDEX, body=req, refresh=True)
            return account_add_res

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:add_account")
            print(str(e))
            return {"failure": str(e)}

    def add(self, data: dict):
        print(" >>> Enter file:aaa:class:Account:function:add")
        try:
            # make sure the identifier posted by the operator is not already taken.
            if self.list_by_email(data["email"])["hits"]["total"]["value"] > 0:
                raise Exception("Account identifier already exists. Use another identifier to create a new account.")

            self.add_account(data)

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:add")
            print(str(e))
            return {"failure": str(e)}

    def delete(self, account_email: str, account_id: str):
        """
        This function delete one or more existing account
        param: account_email: the account_email of the account requesting the deletion
        param: account_ids: the list of account id to be deleted
        """
        print(" >>> Enter file:aaa:class:Account:function:delete")
        try:
            return self.ES.delete(index=self.DB_INDEX, id=account_id, refresh=True)

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:delete")
            print(str(e))
            return {"failure": str(e)}

    def grant_account_to_realm(self, account_email: str, realm_name: str):
        """ This function grant account into a realm """
        print(" >>> Enter file:aaa:class:realm:function:grant_account_to_realm")
        try:
            account = self.list_by_email(account_email)["hits"]["hits"][0]
            account["_source"]["realm"].append({"name": realm_name, "active": False})
            return self.update(account["_id"], account["_source"])

        except Exception as e:
            print("backend Exception, file:aaa:class:realm:func:grant_account_to_realm")
            print(str(e))
            return {"failure": str(e)}

    def revoke_account_from_realm(self, account_email: str, realm_name: str):
        """ This function revoke account from a realm. The realm must not be the account active realm """
        print(" >>> Enter file:aaa:class:realm:function:revoke_account_from_realm")
        try:
            account = self.list_by_email(account_email)["hits"]["hits"][0]
            for idx in range(account["_source"]["realm"]):
                if account["_source"]["realm"][idx]["name"] == realm_name:
                    if not account["_source"]["realm"][idx]["active"]:
                        del account["_source"]["realm"][idx]
                        return self.update(account["_id"], account["_source"])
                    else:
                        return {"failure": str("You cannot be revoked from active realm.")}

        except Exception as e:
            print("backend Exception, file:aaa:class:realm:func:revoke_account_from_realm")
            print(str(e))
            return {"failure": str(e)}

    def delete_by_realm(self, realm: str):
        """ This function delete realm from all users """
        print(" >>> Enter file:aaa:class:Account:function:delete_by_realm")
        try:
            accounts = self.list_by_realm_full(realm)
            for account in accounts["hits"]["hits"]:
                for idx in range(0, len(account["_source"]["realm"])-1):
                    if account["_source"]["realm"][idx]["name"] == realm:
                        del account["_source"]["realm"][idx]
                self.update(account["_id"], account["_source"])

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:delete_by_realm")
            print(str(e))
            return {"failure": str(e)}

    def is_active_realm_member(self, account_email: str, realm: str):
        """
        This function check if there is a match between the account email provided and the realm
        After the token check, an additional check is done, the account provided can only query his current active realm
        param: account_email: account email passed by the requestor
        param: realm: realm name passed by requestor in the REST API path
        """
        print(" >>> Enter file:aaa:class:Account:function:is_active_realm_member")
        try:
            accounts = self.list_by_active_realm(realm)
            for account in accounts["hits"]["hits"]:
                if account["_source"]["email"] == account_email:
                    return True
            return False

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:is_active_realm_member")
            print(str(e))
            return {"failure": str(e)}

    def is_realm_member(self, account_email: str, realm: str):
        """ This function check if the account_email passed is member of the realm passed """
        print(" >>> Enter file:aaa:class:Account:function:is_realm_member")
        try:
            accounts = self.list_by_realm(realm)
            for account in accounts["hits"]["hits"]:
                if account["_source"]["email"] == account_email:
                    return True
            return False

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:is_realm_member")
            print(str(e))
            return {"failure": str(e)}

    def is_valid_token(self, email: str, token: str):
        print(" >>> Enter file:aaa:class:Account:function:is_valid_token")
        try:
            secret = self.list_to_login(email)["hits"]["hits"][0]["_source"]["secret"]
            jwt.decode(token, secret, verify=True)
            return True

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:is_valid_token")
            print(str(e))
            return False

    def list(self):
        """ this function list and account by id """
        print(" >>> Enter file:aaa:class:Account:function:list")
        try:
            req = json.dumps(
                {
                    "size": 1000,
                    "query": {
                        "match_all": {}
                    },
                    "sort": [
                        {
                            "email": {
                                "order": "asc"
                            }
                        }
                    ]
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req, _source_excludes="password,secret")

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func: list")
            print(str(e))
            return {"failure": str(e)}

    def list_by_id(self, account_id: str):
        """ this function list the record matching the account id passed as param """
        print(" >>> Enter file:aaa:class:Account:function:list_by_id")
        try:
            req = json.dumps(
                {
                    "query": {
                        "term": {
                            "_id": account_id
                        }
                    },
                    "sort": [
                        {
                            "email": {
                                "order": "asc"
                            }
                        }
                    ]
                }
            )
            print(req)
            return self.ES.search(index=self.DB_INDEX, body=req, _source_excludes="password,secret")

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:list_by_id")
            print(str(e))
            return {"failure": str(e)}

    def list_by_email(self, email: str):
        """ this function returns the record matching without password and secret """
        print(" >>> Enter file:aaa:class:Account:function:list_by_email")
        try:
            req = json.dumps(
                {
                    "query": {
                        "term": {
                            "email": email
                        }
                    },
                    "sort": [
                        {
                            "email": {
                                "order": "asc"
                            }
                        }
                    ]
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req, _source_excludes="password,secret")

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:list_by_email")
            print(str(e))
            return {"failure": str(e)}

    def list_by_realm(self, realm: str):
        """ this function returns a list of account records without password and secret """
        print(" >>> Enter file:aaa:class:Account:function:list_by_realm")
        try:
            req = json.dumps(
                {
                    "size": 1000,
                    "query": {
                        "nested": {
                            "path": "realm",
                            "query": {
                                "match": {
                                    "realm.name": realm
                                }
                            }
                        }
                    },
                    "sort": [
                        {
                            "email": {
                                "order": "asc"
                            }
                        }
                    ]
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req, _source_excludes="password,secret")

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:list_by_realm")
            print(str(e))
            return {"failure": str(e)}

    def list_by_realm_full(self, realm: str):
        """ This function returns a list of full account records """
        print(" >>> Enter file:aaa:class:Account:function:list_by_realm_full")
        try:
            req = json.dumps(
                {
                    "size": 1000,
                    "query": {
                        "nested": {
                            "path": "realm",
                            "query": {
                                "match": {
                                    "realm.name": realm
                                }
                            }
                        }
                    },
                    "sort": [
                        {
                            "email": {
                                "order": "asc"
                            }
                        }
                    ]
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:list_by_realm_full")
            print(str(e))
            return {"failure": str(e)}

    def list_by_active_realm(self, realm: str):
        print(" >>> Enter file:aaa:class:Account:function:list_by_active_realm")
        try:
            req = json.dumps(
                {
                    "size": 1000,
                    "query": {
                        "nested": {
                            "path": "realm",
                            "query": {
                                "bool": {
                                    "must": [
                                        {
                                            "term": {
                                                "realm.name": realm
                                            }
                                        },
                                        {
                                            "term": {
                                                "realm.active": True
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    "sort": [
                        {
                            "email": {
                                "order": "asc"
                            }
                        }
                    ]
                }
            )
            print(req)
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:list_by_active_realm")
            print(str(e))
            return {"failure": str(e)}

    def list_active_realm(self, account_id: str):
        print(" >>> Enter file:aaa:class:Account:function:list_active_realm")
        try:
            accounts = self.list_by_id(account_id)
            print(accounts)
            for realm in accounts["hits"]["hits"][0]["_source"]["realm"]:
                if realm["active"]:
                    return realm

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:list_active_realm")
            print(str(e))
            return {"failure": str(e)}

    def list_to_login(self, email: str):
        """ this function returns the record matching the email passed as param """
        print(" >>> Enter file:aaa:class:Account:function:list_to_login")
        try:
            req = json.dumps(
                {
                    "query": {
                        "term": {
                            "email": email
                        }
                    }
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:list_to_login")
            print(str(e))
            return {"failure": str(e)}

    @staticmethod
    def load_account_jwt(account):
        """ this function returns a jwt for the account passed as argument """
        print(" >>> Enter file:aaa:class:Account:function:load_account_jwt")
        account_secret = account["_source"]["secret"]
        account_email = account["_source"]["email"]
        jwt_payload = {"email": account_email, "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=480)}
        jwt_str = jwt.encode(jwt_payload, account_secret, algorithm="HS256")
        return jwt_str.decode("utf-8").strip('\"')

    def load_account_profile(self, account_email: str):
        """ This function returns the account which is set a account cookie """
        print(" >>> Enter file:aaa:class:Account:function:load_account_profile")
        try:
            http_response = {}
            scriptlangs = {}
            scriptlang = Scriptlang(self.ES)
            realm = Realm(self.ES)

            account = self.list_by_email(account_email)
            realm_name = self.list_active_realm(account["hits"]["hits"][0]["_id"])["name"]
            realm_details = realm.list_by_name(realm_name)

            for sclang in scriptlang.list()["hits"]["hits"]:
                scriptlangs[sclang["_source"]["name"]] = sclang["_source"]["picture"]

            if not realm_details["hits"]["total"]["value"] == 1:
                raise Exception("Account realm loading issue. Internal Error")

            stg = self.SETTING.list_by_realm_no_passwd(realm_name)
            http_response["account"] = account["hits"]["hits"][0]["_source"]
            http_response["account"]["id"] = account["hits"]["hits"][0]["_id"]
            http_response["realm"] = realm_details["hits"]["hits"][0]["_source"]
            http_response["realm"]["id"] = realm_details["hits"]["hits"][0]["_id"]
            http_response["setting"] = stg["hits"]["hits"][0]["_source"]
            http_response["setting"]["id"] = stg["hits"]["hits"][0]["_id"]
            http_response["scriptlangs"] = scriptlangs
            return http_response

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:load_account_profile")
            print(str(e))
            return {"failure": str(e)}

    def authenticate(self, email: str, password: str):
        """ this function login an account and return JWT token """
        print(" >>> Enter file:aaa:class:Account:function:Authenticate")
        try:
            account = self.list_to_login(email)["hits"]["hits"][0]

            if not pbkdf2_sha512.verify(password, account["_source"]["password"]):
                raise Exception("Authentication failed. User or Password is not correct")

            return {"jwt": self.load_account_jwt(account)}

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:login")
            print(str(e))
            return {"failure": str(e)}

    def update(self, account_id: str, data: dict):
        print(" >>> Enter file:aaa:class:Account:function:update")
        try:
            return self.ES.update(index=self.DB_INDEX, id=account_id, body=json.dumps({"doc": data}), refresh=True)

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:update")
            print(str(e))
            return {"failure": str(e)}

    def update_password(self, account_id: str, password_data: dict):
        """
        param: account_id:
        param: password_data
            new: the new account password
            old: the old account password
        account data is charged using the account id
        checking if the old password is correct then update account with new password
        else return an error.
        """
        print(" >>> Enter file:aaa:class:Account:function:update_password")
        try:
            account = self.list_to_login(self.list_by_id(account_id)["hits"]["hits"][0]["_source"]["email"])["hits"]["hits"][0]

            if not pbkdf2_sha512.verify(password_data["old"], account["_source"]["password"]):
                raise Exception("Account password update failed. Password is not correct")

            account["_source"]["password"] = encrypt_password(password_data["new"])
            account_update_passwd_res = self.update(account_id, account["_source"])
            return account_update_passwd_res

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:update_password")
            print(str(e))
            return {"failure": str(e)}

    def update_profile(self, account_id: str, data: dict):
        print(" >>> Enter file:aaa:class:Account:function:update_profile")
        try:
            current_account = self.list_by_id(account_id)["hits"]["hits"][0]["_source"]

            if data["account_picture"] != "undefined":
                current_account["picture"] = account_id
                picture_path = os.path.join(data["web_server_path"], 'img/profile/', current_account["picture"])
                add_profile_picture(picture_path, data["account_picture"].read())

            if data["account_first_name"] != "":
                current_account["first_name"] = data["account_first_name"]

            if data["account_family_name"] != "":
                current_account["family_name"] = data["account_family_name"]

            if data["account_email"] != "":
                current_account["email"] = data["account_email"]

            return self.update(account_id, current_account)

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:update_profile")
            print(str(e))
            return {"failure": str(e)}
