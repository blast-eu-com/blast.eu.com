/*
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
*/

import FrontendConfig from './frontend.js'
import Account from './aaa.js'

var config = new FrontendConfig()
var account = new Account()

class Request {
    constructor() {
        this._id
        this._object
        this._action
        this._status
        this._sender
        this._receiver
        this._timestamp
        this._message
    }

    set id(_id) { this._id = _id }
    set object(_object) { this._object = _object }
    set action(_action) { this._action = _action }
    set status(_status) { this._status = _status }
    set sender(_sender) { this._sender = _sender }
    set receiver(_receiver) { this._receiver = _receiver }
    set timestamp(_timestamp) { this._timestamp = _timestamp }
    set message(_message) { this._message = _message }

    get id() { return this._id }
    get object() { return this._object }
    get action() { return this._action }
    get status() { return this._status }
    get sender() { return this._sender }
    get receiver() { return this._receiver }
    get timestamp() { return this._timestamp }
    get message() { return this._message }

    add = function(data) {
        return new Promise(function( resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/requests',
                type: "POST",
                headers: {'Authorization': config.session.httpToken},
                data: JSON.stringify({"request": data}),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    execUserAction = function(userAction, requestId) {
        return new Promise(function( resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/requests/actions',
                type: "POST",
                headers: {'Authorization': config.session.httpToken},
                data: JSON.stringify({"requestData": {"requestId": requestId, "userAction": userAction}}),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    list = function() {
        /*
            This function list all the requests for which
            the account email matches the sender value or the receiver value
        */
        return new Promise(function( resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/requests',
                type: "GET",
                headers: {'Authorization': config.session.httpToken},
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    listById = function(id) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/requests/' + id,
                type: "GET",
                headers: {'Authorization': config.session.httpToken},
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    load = function(request_data) {
        let data = request_data["_source"]
        this.id = request_data["_id"]
        this.object = data["object"]
        this.action = data["action"]
        this.status = data["status"]
        this.sender = data["sender"]
        this.receiver = data["receiver"]
        this.timestamp = data["timestamp"]
        this.message = data["message"]
    }

}

export default Request