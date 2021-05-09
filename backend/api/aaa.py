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
        self.DB_INDEX = 'realm'
        self.ACCOUNT = Account(self.ES)
        self.CLUSTER = cluster.Cluster(self.ES)
        self.INFRA = infra.Infra(self.ES)
        self.NODE = node.Node(self.ES)
        self.PORTMAP = Portmap(self.ES)
        self.SETTING = Setting(self.ES)

    def __add__(self, account_email: str, realms: list):
        """ this function create a new realm """
        # adding a new realm into the database
        # the data must contain several information fields like :
        # name, description and settings
        # the realm settings will be impacting the user
        try:
            resp_realm_add = []
            for realm in realms:
                if self.list_by_names(realm["name"].split(" "))["hits"]["total"]["value"] == 0:
                    realm["account_email"] = account_email
                    new_realm = self.ES.index(index=self.DB_INDEX, body=json.dumps(realm), refresh=True)

                    if new_realm["result"] == "created":
                        new_stg = self.SETTING.__add__(realm["name"])

                        if new_stg["result"] == "created":
                            acc = self.ACCOUNT.list_by_email(account_email)

                            if acc["hits"]["total"]["value"] > 0:
                                account_id = acc["hits"]["hits"][0]["_id"]
                                account_core = acc["hits"]["hits"][0]["_source"]
                                account_core["realm"].append({"name": realm["name"], "favorite": False})
                                account_update = self.ACCOUNT.update(account_id, account_core)

                                if account_update["result"] == "updated":
                                    portmap_provision(realm["name"])
                                    resp_realm_add.append(new_realm)
            return resp_realm_add

        except Exception as e:
            print("backend Exception, file:aaa:class:realm:func:__add__")
            print(str(e))
            return {"failure": str(e)}

    def __delete__(self, account_email: str, realm_ids: list):

        """ this function delete an existing account object from the database """
        try:
            resp_realm_del = []
            for realm_id in realm_ids:
                realm_name = self.list_by_ids(realm_id.split(" "))["_source"]["name"]
                links = self.ACCOUNT.list_by_active_realm(realm_name)
                if not links["hits"]["total"]["value"] > 0:
                    self.NODE.delete_by_realm({"realm": realm_name, "account_email": account_email})
                    self.CLUSTER.delete_by_realm({"realm": realm_name, "account_email": account_email})
                    self.INFRA.delete_by_realm({"realm": realm_name, "account_email": account_email})
                    self.SETTING.delete_by_realm(realm_name)
                    self.PORTMAP.delete_by_realm(realm_name)
                    self.ACCOUNT.delete_by_realm(realm_name)
                    resp_realm_del.append(self.ES.delete(index=self.DB_INDEX, id=realm_id, refresh=True))
            return resp_realm_del

        except Exception as e:
            print("backend Exception, file:aaa:class:realm:func:__delete__")
            print(str(e))
            return {"failure": str(e)}

    def update(self, data: dict):

        try:
            id = data["id"]
            del data["id"]
            return self.ES.update(index=self.DB_INDEX, id=id, body=json.dumps({"doc": data}), refresh=True)

        except Exception as e:
            print("backend Exception, file:aaa:class:realm:func:update")
            print(str(e))
            return {"failure": str(e)}

    def __list__(self):

        """ this function returns all the realm object present in the database """
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
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:aaa:class:realm:func:__list__")
            print(e)
            return {"failure": e}

    def list_by_ids(self, ids: list):

        """ this function returns the realm by realm id as passed via function param """
        try:
            req = json.dumps(
                {
                    "query": {
                        "terms": {
                            "_id": ids
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
            print("backend Exception, file:aaa:class:realm:func:list_by_ids")
            print(str(e))
            return {"failure": str(e)}

    def list_by_names(self, names: list):

        """ this function returns the realm object with the given name """
        try:
            req = json.dumps(
                {
                    "size": 10000,
                    "query": {
                        "terms": {
                            "name": names
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
            print(req)
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:aaa:class:realm:func:list_by_names")
            print(str(e))
            return {"failure": str(e)}


class Account:

    def __init__(self, ESConnector):
        self.ES = ESConnector
        self.DB_INDEX = 'account'
        self.SETTING = Setting(self.ES)

    def activate_realm(self, account_email: str, new_realm: str):
        """
        This function switches account realm to a new realm
        param: account_email: the account email of the account that order the realm switch
        param: new_realm: the new active realm is the new_realm
        """
        try:
            acc = self.__list_to_login(account_email)["hits"]["hits"][0]
            for realm in acc["_source"]["realm"]:
                realm["favorite"] = True if realm["name"] == new_realm else False
            return self.update(acc["_id"], acc["_source"])

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:active_realm")
            print(str(e))
            return {"failure": str(e)}

    def add_account(self, data: dict):
        try:
            req = json.dumps(
                {
                    "email": data["email"],
                    "password": encrypt_password(data["password"]),
                    "picture": "profile-picture.png",
                    "secret": SECRET,
                    "realm": [
                        {
                            "name": "default",
                            "favorite": True
                        }
                    ]
                }
            )
            return self.ES.index(index=self.DB_INDEX, body=req, refresh=True)

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:add_account")
            print(str(e))
            return {"failure": str(e)}

    def __add__(self, data: dict):

        try:
            res_search_account = self.list_by_email(data["email"])
            if "hits" in res_search_account.keys():
                if res_search_account["hits"]["total"]["value"] > 1:
                    return {"failure": "AccountAlreadyExist"}
            self.add_account(data)

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:__add__")
            print(str(e))
            return {"failure": str(e)}

    def __delete__(self, account_email: str, account_ids: list):

        """
        This function delete one or more existing account
        param: account_email: the account_email of the account requesting the deletion
        param: account_ids: the list of account id to be deleted
        """
        try:
            resp_accounts_del = []
            for account_id in account_ids:
                resp_accounts_del.append(self.ES.delete(index=self.DB_INDEX, id=account_id, refresh=True))
            return resp_accounts_del

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:__delete__")
            print(str(e))
            return {"failure": str(e)}

    def delete_by_realm(self, realm: str):

        """
        This function delete realm from all users
        """
        try:
            accounts = self.__list_by_realm_full(realm)
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

    def is_valid_token(self, email: str, token: str):

        try:
            secret = self.__list_to_login(email)["hits"]["hits"][0]["_source"]["secret"]
            jwt.decode(token, secret, verify=True)
            return True

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:is_valid_token")
            print(str(e))
            return False

    def __list__(self):

        """ this function list and account by id """
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
            print("backend Exception, file:aaa:class:account:func: __list__")
            print(str(e))
            return {"failure": str(e)}

    def list_by_ids(self, account_ids: list):

        """ this function list the record matching the account id passed as param """
        try:
            req = json.dumps(
                {
                    "query": {
                        "terms": {
                            "_id": account_ids
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
            print("backend Exception, file:aaa:class:account:func: list_by_ids")
            print(str(e))
            return {"failure": str(e)}

    def list_by_email(self, email: str):

        """ this function returns the record matching without password and secret """
        try:
            req = json.dumps(
                {
                    "query": {
                        "match": {
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

    def __list_by_realm_full(self, realm: str):

        """
        This function returns a list of full account records
        """
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
            print("backend Exception, file:aaa:class:account:func:__list_by_realm_full")
            print(str(e))
            return {"failure": str(e)}

    def list_by_active_realm(self, realm: str):

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
                                            "match": {
                                                "realm.name": realm
                                            }
                                        },
                                        {
                                            "match": {
                                                "realm.favorite": True
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
            print("backend Exception, file:aaa:class:account:func: list_by_active_realm")
            print(str(e))
            return {"failure": str(e)}

    def list_active_realm(self, account_id: str):

        try:
            accounts = self.list_by_ids(account_id.split(" "))
            print(accounts)
            for realm in accounts["hits"]["hits"][0]["_source"]["realm"]:
                if realm["favorite"]:
                    return realm

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func: list_active_realm")
            print(str(e))
            return {"failure": str(e)}

    def __list_to_login(self, email: str):

        """ this function returns the record matching the email passed as param """
        try:
            req = json.dumps(
                {
                    "query": {
                        "match": {
                            "email": email
                        }
                    }
                }
            )
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:__list_to_login")
            print(str(e))
            return {"failure": str(e)}

    @staticmethod
    def __load_account_jwt(account):

        """ this function returns a jwt for the account passed as argument """
        account_secret = account["_source"]["secret"]
        account_email = account["_source"]["email"]
        jwt_payload = {"email": account_email, "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=480)}
        jwt_str = jwt.encode(jwt_payload, account_secret, algorithm="HS256")
        return jwt_str.decode("utf-8").strip('\"')

    def load_account_profile(self, account_email: str):

        """
        This function returns the account which is set a account cookie
        """
        try:
            http_response = {}
            scriptlangs = {}
            scriptlang = Scriptlang(self.ES)
            realm = Realm(self.ES)

            account = self.list_by_email(account_email)
            realm_name = self.list_active_realm(account["hits"]["hits"][0]["_id"])["name"]
            realm_details = realm.list_by_names(realm_name.split(" "))

            for sclang in scriptlang.__list__()["hits"]["hits"]:
                scriptlangs[sclang["_source"]["name"]] = sclang["_source"]["picture"]

            if realm_details["hits"]["total"]["value"] == 1:
                stg = self.SETTING.list_by_realm(realm_name)
                http_response["account"] = account["hits"]["hits"][0]["_source"]
                http_response["account"]["id"] = account["hits"]["hits"][0]["_id"]
                http_response["realm"] = realm_details["hits"]["hits"][0]["_source"]
                http_response["realm"]["id"] = realm_details["hits"]["hits"][0]["_id"]
                http_response["setting"] = stg["hits"]["hits"][0]["_source"]
                http_response["setting"]["id"] = stg["hits"]["hits"][0]["_id"]
                http_response["scriptlangs"] = scriptlangs
                return http_response

            else:
                raise ValueError("Loading realm details failure: realm maybe not found")

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:load_account_profile")
            print(str(e))
            return {"failure": str(e)}

    def authenticate(self, email: str, password: str):

        """ this function login an account and return JWT token """
        try:
            http_response = {}
            account = self.__list_to_login(email)["hits"]["hits"][0]
            if pbkdf2_sha512.verify(password, account["_source"]["password"]):
                http_response["jwt"] = self.__load_account_jwt(account)
                return http_response
            else:
                raise Exception("Authentication failure: User or Password is not correct")

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:login")
            print(str(e))
            return {"failure": str(e)}

    def update(self, account_id: str, data: dict):

        try:
            return self.ES.update(index=self.DB_INDEX, id=account_id, body=json.dumps({"doc": data}), refresh=True)

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:update")
            print(str(e))
            return {"failure": str(e)}

    def update_profile(self, account_id: str, data: dict):

        try:
            current_account = self.list_by_ids(account_id.split(" "))["_source"]

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
