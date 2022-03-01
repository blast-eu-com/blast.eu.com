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
import datetime
from .aaa import Account, Realm


class Request:

    def __init__(self, connector):
        self.ES = connector
        self.DB_INDEX = 'blast_request'

    def add(self, account_email: str, request_data: dict):
        """ This function add a new request. """
        print(" >>> Enter file:request:class:request:function:add")
        try:
            account = Account(self.ES)
            if account.list_by_email(account_email)["hits"]["hits"][0]["_source"]["email"] != request_data["sender"]:
                raise Exception("Request sender identity check issue.")

            if request_data["object"] == "realm":
                rlm = Realm(self.ES)
                if request_data["action"] == "subscribe":
                    request_data["action"] = {"name": "subscribe"}
                    request_data["state"] = "new"
                    request_data["receiver"] = rlm.list_owner_delegate_member_by_name(request_data["data"]["value"])
                    request_data["timestamp"] = datetime.datetime.utcnow().isoformat()
            return self.ES.index(index=self.DB_INDEX, body=json.dumps(request_data), refresh=True)

        except Exception as e:
            print("backend Exception, file:request:class:request:func:add")
            print(str(e))
            return {"failure": str(e)}

    def accept(self, request_data: dict):
        print(" >>> Enter file:request:class:request:function:accept")
        try:
            if request_data["_source"]["object"] == "realm":
                realm = Realm(self.ES)

                if request_data["_source"]["action"]["name"] == "subscribe":
                    realm_data = {
                        "name": request_data["_source"]["data"]["value"],
                        "member": request_data["_source"]["sender"],
                        "active": False,
                        "role": "regular"
                    }

                    if realm.add(realm_data)["result"] != "created":
                        raise Exception("Request approve action failure.")

                    request_data["_source"]["action"]["state"] = "accepted"
                    request_data["_source"]["action"]["timestamp"] = datetime.datetime.utcnow().isoformat()
                    request_data["_source"]["state"] = "complete"

                else:
                    raise Exception("Request action is not recognized.")

            return request_data

        except Exception as e:
            print("backend Exception, file:request:class:request:func:accept")
            print(str(e))
            return {"failure": str(e)}

    @staticmethod
    def reject(request_data: dict):

        request_data["_source"]["action"]["state"] = "rejected"
        request_data["_source"]["action"]["timestamp"] = datetime.datetime.utcnow().isoformat()
        request_data["_source"]["state"] = "complete"
        return request_data

    @staticmethod
    def cancel(request_data: dict):

        request_data["_source"]["action"]["state"] = "cancelled"
        request_data["_source"]["action"]["timestamp"] = datetime.datetime.utcnow().isoformat()
        request_data["_source"]["state"] = "complete"
        return request_data

    def action(self, account_email: str, request_id: str, user_action: str):
        print(" >>> Enter file:request:class:request:function:action")
        try:
            account = Account(self.ES)
            request_action_sender = account.list_by_email(account_email)["hits"]["hits"][0]["_source"]["email"]
            request_data = self.list_by_id(account_email, request_id)["hits"]["hits"][0]
            print(account_email, request_id, request_data)

            if user_action == "accept":
                if not request_action_sender in request_data["_source"]["receiver"]:
                    raise Exception("Request receiver identity check issue.")

                request_data = self.accept(request_data)

            elif user_action == "reject":
                if not request_action_sender in request_data["_source"]["receiver"]:
                    raise Exception("Request receiver identity check issue.")

                request_data = self.reject(request_data)

            elif user_action == "cancel":
                if not request_action_sender in request_data["_source"]["sender"]:
                    raise Exception("Request sender identity check issue.")

                request_data = self.cancel(request_data)

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

    def list_by_account(self, account_email):
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

    def list_by_account_and_state(self, account_email: str, state: str):
        """
            This function returns the request where the receiver and sender
            is equal to the receiver and sender and the state is equal to the value passed
        """
        try:
            req = json.dumps(
                {
                    "query": {
                        "bool": {
                            "must": {
                                "term": {
                                    "state": state
                                }
                            },
                            "should": [
                                {
                                    "term": {
                                        "receiver": account_email
                                    }
                                },
                                {
                                    "term": {
                                        "sender": account_email
                                    }
                                }
                            ]
                        }
                    }
                }
            )

            return self.ES.search(index=self.DB_INDEX, body=req)

        except Exception as e:
            print("backend Exception, file:request:class:request:func:list_by_account_and_state")
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
