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

let Infrastructure = class {

    constructor() {
        this._id = undefined
        this._name = undefined
        this._description = undefined
        this._clusters = undefined
        this._data = undefined
    }

    set id(id) { this._id = id }
    set name(name) { this._name = name }
    set description(desc) { this._description = desc }
    set clusters(clusters) { this._clusters = clusters }
    set rawData(data) { this._data = data }

    get id() { return this._id }
    get name() { return this._name }
    get description() { return this._description }
    get clusters() { return this._clusters }
    get rawData() { return this._data }

    add = function(infrastructure) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/infrastructures',
                type: "POST",
                headers: {'Authorization': config.session.httpToken},
                data: JSON.stringify({"infrastructure": infrastructure}),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    add_cluster = function(infra_id, cluster) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/infrastructures/' + infra_id + '/clusters',
                type: "POST",
                headers: {'Authorization': config.session.httpToken},
                data: JSON.stringify({"cluster": cluster}),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    delete = function(infraId) {
        return new Promise( function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/infrastructures',
                type: "DELETE",
                headers: {'Authorization': config.session.httpToken},
                data: JSON.stringify({'infrastructure_id': infraId}),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    delete_cluster = function(infraId, clusterName) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/infrastructures/' + infraId + '/clusters',
                type: "DELETE",
                headers: {'Authorization': config.session.httpToken},
                data: JSON.stringify({"cluster_name": clusterName}),
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
         return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/infrastructures',
                type: "GET",
                headers: {'Authorization': config.session.httpToken},
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    listById = function(infraId) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/infrastructures/ids',
                type: "GET",
                data: {"id": infraId},
                headers: {'Authorization': config.session.httpToken},
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    tree = function() {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realm/' + config.session.realm + '/infrastructures/tree',
                type: "GET",
                headers: {"Authorization": config.session.httpToken},
                success: function (Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    load = function(data) {
        this.id = data["_id"]
        this.name = data["_source"]["name"]
        this.description = data["_source"]["description"]
        this.clusters = data["_source"]["clusters"]
        this.rawData = data["_source"]
    }
}

export default Infrastructure