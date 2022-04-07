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

import Script from './script.js'
import Account from './account.js'
import Node from './node.js'
import FrontendConfig from './frontend.js'

var config = new FrontendConfig()
var script = new Script()
var account = new Account()
var node = new Node()

let Scenario = class {

    constructor() {
        // all related to management run
        this._id
        this.scenarioName
        this.scenarioDescription
        this.scenarioScripts = []
        this.scenarioNodes = []
        this.scenarioAccountEmail
        this.scenarioParallelMode
        this.scenarioScriptThreads
        this._rd

    }

    set id(id) { this._id = id }
    set name(name) { this.scenarioName = name }
    set description(description) { this.scenarioDescription = description }
    set scripts(scripts) { this.scenarioScripts = scripts }
    set nodes(nodes) { this.scenarioNodes = nodes }
    set flag_parallel_mode(fpm) { this.scenarioParallelMode = fpm }
    set account_email(email) { this.scenarioAccountEmail = email }
    set max_parallel_script_threads(sst) { this.scenarioScriptThreads = sst }
    set rawData(rd) { this._rd = rd }

    get id() { return this._id }
    get name() { return this.scenarioName }
    get description() { return this.scenarioDescription }
    get scripts() { return this.scenarioScripts }
    get nodes() { return this.scenarioNodes }
    get flag_parallel_mode() { return this.scenarioParallelMode }
    get account_email() { return this.scenarioAccountEmail }
    get max_parallel_script_threads() { return this.scenarioScriptThreads }
    get rawData() { return this._rd }

    add = async (scenario) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/scenarios'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8"}
        let data = JSON.stringify({ "scenario": scenario })
        let response = await fetch(url, {method: 'POST', headers: header, body: data})
        if (response.ok) {
            response = await response.text()
            response = JSON.parse(response)
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    load = (scenarioData) => {
        this.id = scenarioData["_id"]
        this.name = scenarioData["_source"]["name"]
        this.description = scenarioData["_source"]["description"]
        this.scripts = scenarioData["_source"]["scripts"]
        this.nodes = scenarioData["_source"]["nodes"]
        this.realm = scenarioData["_source"]["realm"]
        this.account_email = scenarioData["_source"]["account_email"]
        this.flag_parallel_mode = scenarioData["_source"]["flag_parallel_mode"]
        this.max_parallel_script_threads = scenarioData["_source"]["max_parallel_script_threads"]
        this.rawData = scenarioData["_source"]
    }

    list = async () => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/scenarios'
        let header = { 'Authorization': config.session.httpToken}
        let response = await fetch(url, {method: 'GET', headers: header})
        if (response.ok) {
            response = await response.text()
            response = JSON.parse(response)
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    listById = async (scenarioId) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/scenarios/' + scenarioId
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'GET', headers: header})
        if (response.ok) {
            response = await response.text()
            response = JSON.parse(response)
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    listByScriptRunId = async (scriptRunId) => {
        let url = config.proxyAPI + '/realm/' + config.session.realm + '/management/scriptrun/' + scriptRunId
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'GET', headers: header})
        if (response.ok) {
            response = await response.text()
            response = JSON.parse(response)
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    searchByName = async (scenarioName) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/scenarios/names/' + scenarioName + '/search'
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'GET', headers: header})
        if (response.ok) {
            response = await response.text()
            response = JSON.parse(response)
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    execute = async (scenario) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/scenarios/execute'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8" }
        let data = JSON.stringify(scenario)
        let response = await fetch(url, {method: 'POST', headers: header, body: data})
        if (response.ok) {
            response = await response.text()
            response = JSON.parse(response)
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    executeById = async (scenarioId) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/scenarios/execute/' + scenarioId
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'GET', headers: header})
        if (response.ok) {
            response = await response.text()
            response = JSON.parse(response)
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    setFormData = async () => {
        this.formData = {
            "name": $("#scenarioName").val(),
            "description": $("#scenarioDescription").val(),
            "flag_parallel_mode": $("#scenarioParallelMode").is(":checked") ? true : false,
            "max_parallel_thread": $("#maxParallelThread").val()
        }
    }

    rolesSelectedNodes = () => {
        let roles = []
        node.listByNames(this.scenarioNodes).then(function(nodesData) {
            nodesData["hits"]["hits"].forEach(function(nodeSource) {
                nodeSource["_source"]["role"].forEach(function(role) {
                    if ( Object.keys(role).includes("application") ) {
                        if ( ! roles.includes(role["application"])) {
                            roles.push(role["application"])
                        }
                    } else if ( Object.keys(role).includes("protocol")) {
                        if ( ! roles.includes(role["protocol"])) {
                            roles.push(role["protocol"])
                        }
                    }
                })
            })
        })
    }
}

export default Scenario