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

import Script from './script.js'
import Account from './account.js'
import Node from './node.js'
import Windower from './windower.js'
import FrontendConfig from './frontend.js'

var config = new FrontendConfig()
var script = new Script()
var account = new Account()
var node = new Node()
var windower = new Windower()

let Scenario = class {

    constructor() {
        // all related to management run
        this._id = undefined
        this.scenarioName = undefined
        this.scenarioDescription = undefined
        this.scenarioScripts = []
        this.scenarioNodes = []
        this.scenarioAccountEmail = undefined
        this.scenarioParallelMode = undefined
        this.scenarioScriptThreads = undefined
        this._rd = undefined

        // all related to script management
        this.scriptPerPage = 10
        this.scriptPageNum = 1
        this.scriptPageMax = 1
        this.scriptFiltered = []

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

    set scenarioScriptPerPage(SPP) { this.scriptPerPage = SPP }
    set scenarioScriptPageNum(SPN) { this.scriptPageNum = SPN }
    set scenarioScriptPageMax(SPM) { this.scriptPageMax = SPM }
    set scenarioScriptFiltered(SMF) { this.scriptFiltered = SMF }

    get id() { return this._id }
    get name() { return this.scenarioName }
    get description() { return this.scenarioDescription }
    get scripts() { return this.scenarioScripts }
    get nodes() { return this.scenarioNodes }
    get flag_parallel_mode() { return this.scenarioParallelMode }
    get account_email() { return this.scenarioAccountEmail }
    get max_parallel_script_threads() { return this.scenarioScriptThreads }
    get rawData() { return this._rd }

    get scenarioScriptPerPage() { return this.scriptPerPage }
    get scenarioScriptPageNum() { return this.scriptPageNum }
    get scenarioScriptPageMax() { return this.scriptPageMax }
    get scenarioScriptFiltered() { return this.scriptFiltered }

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

    getFormData = () => {
        return {
            "name" : this.name,
            "description" : this.description,
            "scripts" : this.scripts,
            "nodes" : this.nodes,
            "ansibleFirst": this.ansibleFirst,
            "parallelMode": this.execMode
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

let sce = new Scenario()

const loadScriptSessManagement = () => {
    return new Promise((resolve, reject) => {
        let docStart = (sce.ManagementSamplePageNum - 1)  * sce.ManagementSamplePerPage
        let docEnd = sce.ManagementSamplePageNum * sce.ManagementSamplePerPage
        let delta = sce.ManagementSampleIntervalPicker * sce.ManagementSampleIntervalCounter
        sce.listSessByTimeAndPageRange(delta, docStart, docEnd).then((data) => {
            console.log(data)
            resolve(data)
        })
    })
}

/* update the select and search script window of the management page
 * add script list core data
 * add script list navigation control
 */
const loadScenarioScriptUIHeader = () => {
    script.listLang().then((scriptLangsData) => {
        windower.scriptSelectAndSearchWindow("managementUIScriptFrame", scriptLangsData["hits"]["hits"])
    })
}

const loadScenarioScriptUICore = () => {
    let pageLength = $("select#scriptSelSamplePerPage option:selected").val()
    script.list().then((scriptData) => {
        windower.scriptSelectAndSearchWindowData(pageLength, scriptData["hits"]["hits"])
    })
}

const loadScenarioScriptUI = () => {
    let pageLength = $("select#scriptSelSamplePerPage option:selected").val()
    script.list().then((scriptData) => {
        if ( scriptData["hits"]["total"]["value"] > 0) {
            loadScenarioScriptUIHeader()
            loadScenarioScriptUICore()
        } else { $("#managementUIScriptFrame").html(msgScriptNotFound) }
    })
}


const scriptSelectAndSearchGoToPrevPage = (pageNum) => {
    script.list().then((objectData) => {
        windower.scriptSelectAndSearchGoToPrevPage(pageNum, objectData["hits"]["hits"])
    })
}

const scriptSelectAndSearchGoToThisPage = (pageNum) => {
    script.list().then((objectData) => {
        windower.scriptSelectAndSearchGoToThisPage(pageNum, objectData["hits"]["hits"])
    })
}

const scriptSelectAndSearchGoToNextPage = (pageNum, lastPage) => {
    script.list().then((objectData) => {
        windower.scriptSelectAndSearchGoToNextPage(pageNum, lastPage, objectData["hits"]["hits"])
    })
}

const loadManagementUI = () => {
    managementFilter.managementWindow('managementFrame')
    management.list().then((managementData) => {
        managementFilter.managementWindowCoreData('undefined', managementData["hits"]["hits"])
    })
}


/* GLOBAL PAGE FUNCTIONS */
const loadScenarioUI = () => {
    loadScriptInfraTreeManagement()
    loadManagementUI()
}

/* DEFINE FUNCTION CALLED FROM PAGE */
window.loadScenarioUI = loadScenarioUI
window.scriptSearchString =  loadScenarioScriptUICore
window.scriptSearchWindowDisplayNewRange = loadScenarioScriptUICore
window.scriptSelectAndSearchGoToPrevPage = scriptSelectAndSearchGoToPrevPage
window.scriptSelectAndSearchGoToThisPage = scriptSelectAndSearchGoToThisPage
window.scriptSelectAndSearchGoToNextPage = scriptSelectAndSearchGoToNextPage

export default Scenario