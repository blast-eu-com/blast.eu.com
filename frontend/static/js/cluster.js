/*
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
*/
import FrontendConfig from './frontend.js'
import Account from './aaa.js'

var config = new FrontendConfig()
var account = new Account()


let Cluster = class {

    constructor() {
        this._id = undefined
        this._name = undefined
        this._description = undefined
        this._nodes = undefined
        this._data = undefined
    }

    set id(id) { this._id = id }
    set name(name) { this._name = name }
    set description(description) { this._description = description }
    set rawData(rawData) { this._data = rawData }
    set nodes(nodes) { this._nodes = nodes }

    get id() { return this._id }
    get name() { return this._name }
    get description() { return this._description }
    get rawData() { return this._data }
    get nodes() { return this._nodes }

    add = function(clusters) {
        /*
         * this function add clusters into the Elasticsearch DB
         * the function receives: formData is a list of cluster object.
         * the function returns: a list of elasticsearch indexing result
         */
        return new Promise(function( resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/clusters',
                type: "POST",
                headers: {'Authorization': config.session.httpToken},
                data: JSON.stringify({"clusters": clusters}),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) {
                        Resp = JSON.parse(Resp)
                        if (Object.keys(Resp).includes("tokenExpired")) {
                            account.logoutAccount()
                        } else if (Object.keys(Resp).includes("failure")) {
                            console.log("failure")
                        }
                    } else if ( typeof Resp === 'object') {
                        resolve(Resp)
                    }
                }
            })
        })
    }

    add_node = function(cluster_id, nodes) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/clusters/' + cluster_id + '/nodes',
                type: "POST",
                headers: {'Authorization': config.session.httpToken},
                data: JSON.stringify({"nodes": nodes}),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) {
                        Resp = JSON.parse(Resp)
                        if (Object.keys(Resp).includes("tokenExpired")) {
                            account.logoutAccount()
                        } else if (Object.keys(Resp).includes("failure")) {
                            console.log("failure")
                        }
                    } else if ( typeof Resp === 'object') {
                        resolve(Resp)
                    }
                }
            })
        })
    }

    delete = function(cluster_ids) {
        /* this function returns the rampart API response *
         * from the API URL /cluster/delete               */
        return new Promise( function( resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/clusters',
                type: "DELETE",
                headers: {'Authorization': config.session.httpToken},
                data: JSON.stringify({'cluster_ids': cluster_ids}),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) {
                        Resp = JSON.parse(Resp)
                        if (Object.keys(Resp).includes("tokenExpired")) {
                            account.logoutAccount()
                        } else if (Object.keys(Resp).includes("failure")) {
                            console.log("failure")
                        }
                    } else if ( typeof Resp === 'object') {
                        resolve(Resp)
                    }
                }
            })
        })
    }

    delete_node = function(cluster_id, node_ids) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/clusters/' + cluster_id + '/nodes',
                type: "DELETE",
                headers: {'Authorization': config.session.httpToken},
                data: JSON.stringify({'node_ids': node_ids}),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (Resp) {
                    if ( typeof Resp === 'string' ) {
                        Resp = JSON.parse(Resp)
                        if (Object.keys(Resp).includes("tokenExpired")) {
                            account.logoutAccount()
                        } else if (Object.keys(Resp).includes("failure")) {
                            console.log("failure")
                        }
                    } else if ( typeof Resp === 'object') {
                        resolve(Resp)
                    }
                }
            })
        })
    }
 
    load = function(data) {
        this.id = data["_id"]
        this.name = data["_source"]["name"]
        this.description = data["_source"]["description"]
        this.nodes = data["_source"]["nodes"]
        this.rawData = data["_source"]
    }

    list = function() {
        /* this function returns the rampart API response *
         * from the API URL /cluster/list                 */
        return new Promise( function( resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/clusters',
                type: "GET",
                headers: {'Authorization': config.session.httpToken},
                success: function(Resp) {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) {
                        account.logoutAccount()
                    } else if (Object.keys(Resp).includes("failure")) {
                        console.log("internal error")
                    } else { resolve(Resp) }
                }
            })
        })
    }

    listByIds = function(cluIds) {
        /* this function returns the rampart API response *
         * from the API endpoint /cluster/list_by_id      */
         return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/clusters/ids',
                type: "GET",
                headers: {'Authorization': config.session.httpToken},
                data: {"ids": cluIds},
                success: function(Resp) {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) {
                        account.logoutAccount()
                    } else if (Object.keys(Resp).includes("failure")) {
                        console.log("internal error")
                    } else { resolve(Resp) }
                }
            })
         })
    }

    listByNodeIds = function(nodeIds) {
        /* this function returns the rampart API response *
         * from the API URL /cluster/list_by_node_id      */
        return new Promise( function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/clusters/nodes/ids',
                type: "GET",
                headers: {'Authorization': config.session.httpToken},
                data: {"ids": nodeIds},
                success: function(Resp) {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) {
                        account.logoutAccount()
                    } else if (Object.keys(Resp).includes("failure")) {
                        console.log("internal error")
                    } else { resolve(Resp) }
                }
            })
        })
    }
}

export default Cluster
