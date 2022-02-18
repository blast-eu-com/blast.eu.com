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

// load the external objects
import FrontendConfig from './frontend.js'
import Account from './account.js'
let config = new FrontendConfig()
let account = new Account()

let Node = class {

    constructor() {
        this._id
        this._name
        this._description
        this._ip
        this._ip_reference
        this._scan_by_ip
        this._raw_data
        this._roles
        this._mode
    }

    set id(id) { this._id = id }
    set name(name) { this._name = name }
    set description(desc) { this._description = desc }
    set ip(ip) { this._ip = ip }
    set ipReference(ip) { this._ip_reference = ip }
    set scanByIp(bool) { this._scan_by_ip = bool }
    set rawData(rd) { this._raw_data = rd }
    set roles(roles) { this._roles = roles }
    set peers(peers) { this._peers = peers }
    set mode(md) { this._mode = md }

    get id() { return this._id }
    get name() { return this._name }
    get description() { return this._description }
    get ip() { return this._ip }
    get ipReference() { return this._ip_reference }
    get scanByIp() { return this._scan_by_ip }
    get rawData() { return this._raw_data }
    get roles() { return this._roles }
    get peers() { return this._peers }
    get mode() { return this._mode }

    add = async (node) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/nodes'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8" }
        let data = JSON.stringify({ "node": node })
        let response = await fetch(url, {method: 'POST', headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    update = async (nodeId, nodeData) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/nodes'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8"}
        let data = JSON.stringify({ "id": nodeId, "data": nodeData })
        let response = await fetch(url, {method: 'PUT', headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    delete = async (nodeId) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/nodes'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8"}
        let data = JSON.stringify({"node_id": nodeId})
        let response = await fetch(url, {method: 'DELETE', headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    list = async () => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/nodes'
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'GET', headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    listById = async (nodeId) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/nodes/' + nodeId
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'GET', headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    listByName = async (name) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/nodes/names/' + name
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'GET', headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    listNodeType = async () => {
        let url = config.proxyAPI + '/nodes/types'
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'GET', headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    rescan = async (nodeId) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/nodes/' + nodeId + '/rescan'
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'GET', headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    load = (data) => {
        this.id = data["_id"]
        this.name = data["_source"]["name"]
        this.description = data["_source"]["description"]
        this.ip = data["_source"]["ip"]
        this.scanByIp = data["_source"]["scan_by_ip"]
        this.rawData = data["_source"]
        this.roles = data["_source"]["roles"]
        this.peers = data["_source"]["peers"]
        this.mode = data["_source"]["mode"]
        if ( this.scanById ) { this.ipReference = data["_source"]["ip_reference"] }
    }

}

export default Node