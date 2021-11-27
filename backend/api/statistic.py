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
import datetime


def UTC_time():
    return datetime.datetime.isoformat(datetime.datetime.utcnow())


class Statistic:

    def __init__(self, ESConnector):
        self.ES = ESConnector
        self.DB_INDEX = 'blast_statistic'
        self.STATISTIC_DATA = {
            "object_type": "", "object_action": "", "object_name": "", "timestamp": "", "account_email": "", "realm": ""
        }

    def add(self, data: dict):

        """ this function add a new setting document into the database """
        try:
            return self.ES.index(index=self.DB_INDEX, body=json.dumps(data), refresh=True)

        except Exception as e:
            print("backend Exception, file:statistic:class:statistic:func:add")
            print(e)
            return {"failure": str(e)}

    def delete(self, id: str):

        """ this function delete the setting identified as id part of the realm id as passed in arg """
        try:
            return self.ES.delete(index=self.DB_INDEX, id=id, refresh=True)

        except print("backend Exception, file:statistic:class:statistic:func:delete") as e:
            print(e)
            return {"failure": str(e)}

    def list(self, realm: str):

        """ this function returns all the settings attached to the realm id passed as arg """
        try:
            req = json.dumps({
                "query": {
                    "term": {
                        "realm": realm
                    }
                }
            })
            return self.ES.search(index=self.DB_INDEX, body=req)

        except print("backend Exception, file:statistic:class:statistic:func:list") as e:
            print(e)
            return {"failure": str(e)}

    def list_by_id(self, id: str):

        """ this function returns the settings linked contained in inside the doc having the id passed as arg """
        try:
            return self.ES.get(index=self.DB_INDEX, id=id)

        except print("backend Exception, file:statistic:class:statistic:func:list_by_id") as e:
            print(e)
            return {"failure": str(e)}

    def list_by_realm(self, realm: str):

        """ this function returns the settings linked to the realm id passed as arg """
        try:
            req = json.dumps({
                "query": {
                    "term": {
                        "realm": realm
                    }
                }
            })
            return self.ES.search(index=self.DB_INDEX, body=req)

        except print("backend Exception, file:statistic:class:statistic:func:list_by_realm") as e:
            print(e)
            return {"failure": str(e)}

