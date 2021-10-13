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
from api import aaa


class Request:

    def __init__(self, ESConnector):
        self.ES = ESConnector
        self.DB_INDEX = 'blast_request'

    def add(self, account_email: str, request_data: dict):
        print(" >>> Enter file:request:class:Node:function:add")
        print(request_data)
        try:
            account = aaa.Account(self.ES)
            print(account.list_by_email(account_email))
            if account.list_by_email(account_email)["hits"]["hits"][0]["_source"]["email"] == request_data["sender"]:
                if request_data["object"] == "realm":
                    rlm = aaa.Realm(self.ES)
                    print(rlm.list_by_name_full(request_data["data"]["value"]))
                    if request_data["action"] == "subscribe":
                        request_data["action"] = {"name": "subscribe"}
                        request_data["status"] = "new"
                        request_data["receiver"] = rlm.list_by_name_full(request_data["data"]["value"])["hits"]["hits"][0]["_source"]["account_email"]
                        request_data["timestamp"] = datetime.datetime.utcnow().isoformat()
                print(request_data)
                return self.ES.index(index=self.DB_INDEX, body=json.dumps(request_data), refresh=True)

        except Exception as e:
            print("backend Exception, file:request:class:request:func:add")
            print(str(e))
            return {"failure": str(e)}

    def action(self, account_email: str, request_id: str, user_action: str):
        print(" >>> Enter file:request:class:Node:function:action")
        try:
            account = aaa.Account(self.ES)
            request_data = self.list_by_id(account_email, request_id)["hits"]["hits"][0]
            # start working on receiver request
            # a receiver can:
            # - accept a request from a sender
            # - reject a request from a sender
            if account.list_by_email(account_email)["hits"]["hits"][0]["_source"]["email"] == request_data["_source"]["receiver"]:

                # start with action accept. The request receiver accept the sender request
                if user_action == "accept":

                    # working with realm request then instanciate a new realm object
                    if request_data["_source"]["object"] == "realm":
                        realm_name = request_data["_source"]["data"]["value"]

                        if request_data["_source"]["action"]["name"] == "subscribe":
                            account.grant_account_to_realm(request_data["_source"]["sender"], realm_name)
                            request_data["_source"]["action"]["status"] = "accepted"
                            request_data["_source"]["action"]["timestamp"] = datetime.datetime.utcnow().isoformat()
                            request_data["_source"]["status"] = "complete"

                        elif request_data["_source"]["action"]["name"] == "revoke":
                            account.revoke_account_from_realm(request_data["_source"]["sender"], realm_name)
                            request_data["_source"]["action"]["status"] = "revoked"
                            request_data["_source"]["action"]["timestamp"] = datetime.datetime.utcnow().isoformat()
                            request_data["_source"]["status"] = "complete"

                elif user_action == "reject":
                    request_data["_source"]["action"]["status"] = "rejected"
                    request_data["_source"]["action"]["timestamp"] = "01-01-1970T00:00:00"
                    request_data["_source"]["status"] = "complete"

            # continue working on sender request
            # a sender can be:
            # - cancel by the sender before being treated by the receiver
            elif account.list_by_email(account_email)["hits"]["hits"][0]["_source"]["email"] == request_data["_source"]["sender"]:

                if user_action == "cancel":
                    request_data["_source"]["action"]["status"] = "cancelled"
                    request_data["_source"]["action"]["timestamp"] = "0000-00-00T00:00:00"
                    request_data["_source"]["status"] = "complete"

            return self.update(request_data["_id"], request_data["_source"])

        except Exception as e:
            print("backend Exception, file:request:class:request:func:action")
            print(str(e))
            return {"failure": str(e)}

    def update(self, request_id: str, data: dict):
        print(" >>> Enter file:request:class:request:function:update")
        try:
            return self.ES.update(index=self.DB_INDEX, id=request_id, body=json.dumps({"doc": data}), refresh=True)

        except Exception as e:
            print("backend Exception, file:request:class:request:func:action")
            print(str(e))
            return {"failure": str(e)}

    def exec_request(self, request_data):
        pass

    def reject_request(self, request_data):
        pass

    def list(self, account_email):
        """
            This function returns all the requests where
            the account email is equal to the sender value or the requester value
        """
        print(" >>> Enter file:update:class:Request:function:list")
        try:
            req = json.dumps({
                "size": 10000,
                "query": {
                    "bool": {
                        "should": [
                            {
                                "term": {
                                    "sender": account_email
                                }
                            },
                            {
                                "term": {
                                    "receiver": account_email
                                }
                            }
                        ]
                    }
                },
                "sort": [
                    {
                        "timestamp": {
                            "order": "desc"
                        }
                    }
                ]
            })

            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:request:class:request:func:list")
            print(str(e))
            return {"failure": str(e)}

    def list_by_id(self, account_email: str, request_id: str):
        """
            This function returns the request where the _id is equal to id and
            the account email is equal to the sender value or the requester value
        """
        print(" >>> Enter file:request:class:Request:function:list_by_id")
        try:
            req = json.dumps({
                "size": 10000,
                "query": {
                    "bool": {
                        "should": [
                            {
                                "term": {
                                    "sender": account_email
                                }
                            },
                            {
                                "term": {
                                    "receiver": account_email
                                }
                            },
                            {
                                "term": {
                                    "_id": request_id
                                }
                            }
                        ]
                    }
                },
                "sort": [
                    {
                        "timestamp": {
                            "order": "desc"
                        }
                    }
                ]
            })

            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:request:class:request:func:list_by_id")
            print(str(e))
            return {"failure": str(e)}
