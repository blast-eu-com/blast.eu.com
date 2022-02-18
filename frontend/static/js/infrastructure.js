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
import Account from './account.js'

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

    add = async (infrastructure) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/infrastructures'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8" }
        let data = JSON.stringify({"infrastructure": infrastructure})
        let response = await fetch(url, {method: "POST", headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    add_cluster = async (infra_id, cluster) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/infrastructures/' + infra_id + '/clusters'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8" }
        let data = JSON.stringify({"cluster": cluster})
        let response = await fetch(url, {method: "POST", headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    delete = async (infraId) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/infrastructures'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8" }
        let data = JSON.stringify({'infrastructure_id': infraId})
        let response = await fetch(url, {method: "DELETE", headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    delete_cluster = async (infraId, clusterName) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/infrastructures/' + infraId + '/clusters'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8" }
        let data = JSON.stringify({"cluster_name": clusterName})
        let response = await fetch(url, {method: "DELETE", headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }
    
    list = async () => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/infrastructures'
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'GET', headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    listById = async (infraId) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/infrastructures/' + infraId
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'GET', headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    tree = async () => {
        let url = config.proxyAPI + '/realm/' + config.session.realm + '/infrastructures/tree'
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'GET', headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
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