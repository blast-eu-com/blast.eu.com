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

let Cluster = class {

    constructor() {
        this._id
        this._name
        this._description
        this._nodes
        this._data
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

    add = async (cluster) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/clusters'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8" }
        let data = JSON.stringify({ "cluster": cluster })
        let response = await fetch(url, {method: 'POST', headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    add_node = async (cluster_id, node) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/clusters/' + cluster_id + '/nodes'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8" }
        let data = JSON.stringify({ "node": node })
        let response = await fetch(url, {method: 'POST', headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    delete = async (clusterId) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/clusters/' + clusterId
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'DELETE', headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    delete_node = async (clusterId, nodeName) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/clusters/' + clusterId + '/nodes/' + nodeName
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'DELETE', headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }
 
    load = function(clusterData) {
        this.id = clusterData["_id"]
        this.name = clusterData["_source"]["name"]
        this.description = clusterData["_source"]["description"]
        this.nodes = clusterData["_source"]["nodes"]
        this.rawData = clusterData["_source"]
    }

    list = async () => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/clusters'
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'GET', headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    listById = async (clusterId) => {
         let url = config.proxyAPI + '/realms/' + config.session.realm + '/clusters/' + clusterId
         let header = { 'Authorization': config.session.httpToken }
         let response = await fetch(url, {method: 'GET', headers: header})
         if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
         }
    }
}

export default Cluster
