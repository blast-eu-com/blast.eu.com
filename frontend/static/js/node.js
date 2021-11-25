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
import Account from './aaa.js'
let config = new FrontendConfig()
let account = new Account()

const msgNodeNotFound = `<div class="p-5" style="text-align: center;">
<img src="/img/object/node.svg" width="92" height="92"><b><h3 class="mt-3">NODE NOT FOUND</h3></b>
Add an node from this page\'s form to see it appearing into this list.</div>`

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

    add = function(node) {
        return new Promise( function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/nodes',
                type: "POST",
                headers: {'Authorization': config.session.httpToken},
                data: JSON.stringify({"node": node}),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    update = function(id, data) {
       return new Promise( function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/nodes',
                type: "PUT",
                headers: {'Authorization': config.session.httpToken},
                data: JSON.stringify({"id": id, "data": data}),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
       })
    }

    delete = function(nodeId) {
       return new Promise( function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/nodes',
                type: "DELETE",
                headers: {'Authorization': config.session.httpToken},
                data: json.stringify({"node_id": nodeId}),
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
        return new Promise( function( resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/nodes',
                type: "GET",
                headers: {'Authorization': config.session.httpToken},
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    listById = (nodeId) => {
        return new Promise( function( resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/nodes/ids',
                type: "GET",
                data: {"id": nodeId},
                headers: {'Authorization': config.session.httpToken},
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    listByName = (name) => {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/nodes/names',
                type: "GET",
                headers: {"Authorization": config.session.httpToken },
                data: {"name": name},
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    listNodeType = () => {
        return new Promise( function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/nodes/types',
                type: "GET",
                headers: {'Authorization': config.session.httpToken},
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    rescan = (nodeId) => {
        return new Promise( function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/nodes/' + nodeId + '/rescan',
                type: "GET",
                headers: {'Authorization': config.session.httpToken},
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
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