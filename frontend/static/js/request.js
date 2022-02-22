/*
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
*/

import FrontendConfig from './frontend.js'
import Account from './account.js'

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
    set state(_state) { this._state = _state }
    set sender(_sender) { this._sender = _sender }
    set receiver(_receiver) { this._receiver = _receiver }
    set timestamp(_timestamp) { this._timestamp = _timestamp }
    set message(_message) { this._message = _message }

    get id() { return this._id }
    get object() { return this._object }
    get action() { return this._action }
    get state() { return this._state }
    get sender() { return this._sender }
    get receiver() { return this._receiver }
    get timestamp() { return this._timestamp }
    get message() { return this._message }

    add = async (request_data) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/requests'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8"}
        let data = JSON.stringify({"request": request_data})
        let response = await fetch(url, {method: "POST", headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    execUserAction = async (userAction, requestId) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/requests/actions'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8"}
        let data = JSON.stringify({"requestData": {"requestId": requestId, "userAction": userAction}})
        let response = await fetch(url, {method: "POST", headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    list_by_account = async () => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/requests'
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: "GET", headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    list_by_account_and_state = async (state) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/requests/states/' + state
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: "GET", headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    listById = async (id) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/requests/' + id
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: "GET", headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    load = function(request_data) {
        let data = request_data["_source"]
        this.id = request_data["_id"]
        this.object = data["object"]
        this.action = data["action"]
        this.state = data["state"]
        this.sender = data["sender"]
        this.receiver = data["receiver"]
        this.timestamp = data["timestamp"]
        this.message = data["message"]
    }

}

export default Request