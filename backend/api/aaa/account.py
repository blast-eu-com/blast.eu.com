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

import os
import re
import jwt
import json
import string
import random
import base64
import datetime
from passlib.hash import pbkdf2_sha512
from ..setting import Setting
from ..scriptlang import Scriptlang
from ..aaa.realm import Realm

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
    cmd = python_path + ' ' + os.path.join(server_dir, 'builder/build_db_port_map.py') + ' ' + realm
    os.popen(cmd)
    return True


class Account:
    def __init__(self, connector):
        self.ES = connector
        self.DB_INDEX = 'blast_account'

    def add(self, data: dict):
        """ Add a new account from given data, email, password and realm """
        print(" >>> Enter file:aaa:class:Account:function:add_account")
        try:
            # email pattern
            account_email_pattern = re.compile('[a-zA-Z\-\_\.]{6,}\@[a-zA-z]+\.[a-zA-Z\.]+')
            if not account_email_pattern.fullmatch(data["email"]):
                raise Exception("Account identifier is not valid. Enter a valid email address format.")

            # make sure the identifier posted by the operator is not already taken.
            if self.list_by_email(data["email"])["hits"]["total"]["value"] > 0:
                raise Exception("Account identifier already exists. Use another identifier to create a new account.")

            req = json.dumps(
                {
                    "first_name": "",
                    "family_name": "",
                    "alias": "",
                    "email": data["email"],
                    "password": encrypt_password(data["password"]),
                    "picture": "profile-picture.png",
                    "secret": SECRET
                }
            )

            return self.ES.index(index=self.DB_INDEX, body=req, refresh=True)

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:add_account")
            print(str(e))
            return {"failure": str(e)}

    def authenticate(self, email: str, password: str):
        """ this function login an account and return JWT token """
        print(" >>> Enter file:aaa:class:Account:function:Authenticate")
        try:
            account = self.list_by_email(email)["hits"]["hits"][0]

            if not pbkdf2_sha512.verify(password, account["_source"]["password"]):
                raise Exception("Authentication failed. User or Password is not correct")

            return {"jwt": self.load_account_jwt(account)}

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:login")
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

    def is_valid_token(self, email: str, token: str):
        print(" >>> Enter file:aaa:class:Account:function:is_valid_token")
        try:
            secret = self.list_by_email(email)["hits"]["hits"][0]["_source"]["secret"]
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

    def list_by_email_no_sensitive_data(self, account_email: str):
        """ this function returns the record matching without password and secret """
        print(" >>> Enter file:aaa:class:Account:function:list_by_email")
        try:
            req = json.dumps(
                {
                    "query": {
                        "term": {
                            "email": account_email
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

    def list_by_email(self, account_email: str):
        """ this function returns the record matching the email passed as param """
        print(" >>> Enter file:aaa:class:Account:function:list_to_login")
        try:
            req = json.dumps(
                {
                    "query": {
                        "term": {
                            "email": account_email
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
            print(account_email)
            http_response = {}
            scriptlangs = {}
            scriptlang = Scriptlang(self.ES)
            realm = Realm(self.ES)
            setting = Setting(self.ES)
            account = self.list_by_email(account_email)
            realm_details = realm.list_active_by_member(account["hits"]["hits"][0]["_source"]["email"])
            realm_name = realm_details["hits"]["hits"][0]["_source"]["name"]
            realms = realm.list_by_member(account["hits"]["hits"][0]["_source"]["email"])
            print(realms)
            for sclang in scriptlang.list()["hits"]["hits"]:
                scriptlangs[sclang["_source"]["name"]] = sclang["_source"]["picture"]

            stg = setting.list(realm_name)
            http_response["account"] = account["hits"]["hits"][0]["_source"]
            http_response["account"]["id"] = account["hits"]["hits"][0]["_id"]
            http_response["realm"] = realm_details["hits"]["hits"][0]["_source"]
            http_response["realm"]["id"] = realm_details["hits"]["hits"][0]["_id"]
            http_response["realms"] = realms["hits"]["hits"]
            http_response["setting"] = stg["hits"]["hits"][0]["_source"]
            http_response["setting"]["id"] = stg["hits"]["hits"][0]["_id"]
            http_response["scriptlangs"] = scriptlangs
            return http_response

        except Exception as e:
            print("backend Exception, file:aaa:class:account:func:load_account_profile")
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
            account = self.list_by_email(self.list_by_id(account_id)["hits"]["hits"][0]["_source"]["email"])["hits"]["hits"][0]

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

