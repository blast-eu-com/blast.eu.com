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
import json
import elasticsearch
from cryptography.fernet import Fernet


def encrypt_password(crypto, password_to_encrypt):
    f = Fernet(crypto)
    return f.encrypt(password_to_encrypt.encode('utf-8')).decode('utf-8')


def decrypt_password(crypto, encrypted_password):
    f = Fernet(crypto)
    return f.decrypt(encrypted_password.encode('utf-8')).decode('utf-8')


def provision_realm_settings(realm):
    """ this function provision portmap for the realm passed as arg """
    server_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
    python_path = os.path.join(server_dir + '/bin/python3')
    cmd = python_path + ' ' + os.path.join(server_dir, 'builder/build_db_settings.py') + ' ' + realm
    os.popen(cmd)
    return True


class Portmap:

    def __init__(self, ESConnector):
        self.ES = ESConnector
        self.DB_INDEX = 'blast_port_map'

    def __delete__(self, id: str):
        print(" >>> Enter file:setting:class:Portmap:function:__delete__")
        try:
            return self.ES.delete(index=self.DB_INDEX, id=id)

        except (elasticsearch.exceptions.ConnectionError, elasticsearch.exceptions.NotFoundError) as e:
            return {"failure": e}

    def delete_by_realm(self, realm: str):
        """ this function delete the portmap link to this realm """
        print(" >>> Enter file:setting:class:Portmap:function:delete_by_realm")
        portmaps = self.__list__(realm)
        [self.__delete__(portmap["_id"]) for portmap in portmaps["hits"]["hits"]]

    def __list__(self, realm: str):
        """ this function returns the full list of ports mapping """
        print(" >>> Enter file:setting:class:Portmap:function:__list__")
        try:
            req = json.dumps({"size": 10000, "query": {"bool": {
                "must": {"match_all": {}},
                "filter": {"match": {"realm": realm}}
            }}})
            return self.ES.search(index=self.DB_INDEX, body=req)

        except (elasticsearch.exceptions.NotFoundError, elasticsearch.exceptions.ConnectionError) as e:
            return {"failure": e}

    def map_socket(self, realm: str, socket: str):
        """ this function returns the application name assigned to this port """
        print(" >>> Enter file:setting:class:Portmap:function:map_socket")
        try:
            req = json.dumps({"query": {"bool": {"must": [
                {"match": {"port": socket}},
                {"match": {"realm": realm}}
            ]}}})
            return self.ES.search(index=self.DB_INDEX, body=req)

        except (elasticsearch.exceptions.NotFoundError, elasticsearch.exceptions.ConnectionError) as e:
            return {"failure": e}


class Setting:

    def __init__(self, ESConnector):
        self.ES = ESConnector
        self.DB_INDEX = 'setting'

    def __add__(self, realm: str):
        """ this function add a new setting document into the database """
        print(" >>> Enter file:setting:class:Setting:function:__add__")
        try:
            setting_res = self.list_by_realm(realm)
            if setting_res["hits"]["total"]["value"] == 0:
                return provision_realm_settings(realm)

        except Exception as e:
            print(e)
            return {"failure": str(e)}

    def __delete__(self, id: str):
        """ this function delete the setting identified as id part of the realm id as passed in arg """
        print(" >>> Enter file:setting:class:Setting:function:__delete__")
        try:
            setting = self.list_by_id(id)
            return self.ES.delete(index=self.DB_INDEX, id=id, refresh=True)

        except Exception as e:
            print(e)
            return {"failure": str(e)}

    def delete_by_realm(self, realm: str):
        """ this function delete a setting linked to a specific realm """
        print(" >>> Enter file:setting:class:Setting:function:delete_by_realm")
        settings = self.list_by_realm(realm)
        [self.__delete__(setting["_id"]) for setting in settings["hits"]["hits"]]

    def __list__(self, realm: str):
        """ this function returns all the settings attached to the realm id passed as arg """
        print(" >>> Enter file:setting:class:Setting:function:__list__")
        try:
            req = json.dumps({"query": {"bool": {
                "must": {"match_all": {}},
                "filter": {"match": {"realm": realm}}
            }}})
            return self.ES.search(index=self.DB_INDEX, body=req,
                                  _source_excludes="ansible.password, ssh.password, git.password")

        except Exception as e:
            return {"failure": str(e)}

    def list_by_id(self, id: str):
        """ this function retuns the settings linked contained in inside the doc having the id passed as arg """
        print(" >>> Enter file:setting:class:Setting:function:list_by_id")
        try:
            return self.ES.get(index=self.DB_INDEX, id=id)

        except Exception as e:
            return {"failure": e}

    def list_by_realm(self, realm: str):
        """ this function returns the settings linked to the realm id passed as arg """
        print(" >>> Enter file:setting:class:Setting:function:list_by_realm")
        try:
            req = json.dumps({"query": {"match": {"realm": realm}}})
            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            return {"failure": e}

    def list_by_realm_no_passwd(self, realm:str):
        print(" >>> Enter file:setting:class:Setting:function:list_by_realm_no_passwd")
        try:
            setting = self.list_by_realm(realm)
            print(setting)
            del setting["hits"]["hits"][0]["_source"]["ansible"]["password"]
            del setting["hits"]["hits"][0]["_source"]["ssh"]["password"]
            del setting["hits"]["hits"][0]["_source"]["crypto"]
            return setting

        except Exception as e:
            return {"failure": e}

    def list_ssh_password_by_realm(self, realm: str):
        """ this function returns the ssh password decrypted """
        print(" >>> Enter file:setting:class:Setting:function:list_ssh_password_by_realm")
        setting = self.list_by_realm(realm)
        if setting["hits"]["total"]["value"] == 1:
            return decrypt_password(setting["hits"]["hits"][0]["_source"]["crypto"],
                                    setting["hits"]["hits"][0]["_source"]["ssh"]["password"])

    def save(self, id: str, data: dict):
        """ this function save the settings """
        print(" >>> Enter file:setting:class:Setting:function:save")
        try:
            setting = self.list_by_id(id)
            if setting["found"]:

                # encrypt the new ssh password
                if data["ssh"]["password"] != "":
                    data["ssh"]["password"] = encrypt_password(setting["_source"]["crypto"].encode('utf-8'),
                                                               data["ssh"]["password"])
                else:
                    data["ssh"]["password"] = setting["_source"]["ssh"]["password"]

                # encrypt the new ansible password
                if data["ansible"]["password"] != "":
                    data["ansible"]["password"] = encrypt_password(setting["_source"]["crypto"].encode('utf-8'),
                                                                   data["ansible"]["password"])
                else:
                    data["ansible"]["password"] = setting["_source"]["ansible"]["password"]

            print(data)
            return self.ES.update(index=self.DB_INDEX, id=id, body=json.dumps({"doc": data}), refresh=True)

        except Exception as e:
            return {"failure": e}
