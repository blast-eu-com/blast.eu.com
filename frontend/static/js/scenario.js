/*
 *   Copyright 2020 Jerome DE LUCCHI
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
*/

import Script from './script.js'
import Account from './aaa.js'
import Node from './node.js'
import Windower from './windower.js'
import FrontendConfig from './frontend.js'
import Management from './management.js'
import ManagementFilter, { managementGoToPrevPage, managementGoToNextPage, managementGoToThisPage, managementDisplayNewRange } from './blast-ui/bootstrap/management/managementFilter.js'

var config = new FrontendConfig()
var script = new Script()
var account = new Account()
var node = new Node()
var windower = new Windower()
var management = new Management()
var managementFilter = new ManagementFilter()

let Scenario = class {

    constructor() {
        // all related to management run
        this.scenarioName = undefined
        this.scenarioDescription = undefined
        this.scenarioScripts = []
        this.scenarioNodes = []
        this.scenarioAnsibleFirst = undefined
        this.scenarioParallelMode = undefined
        this.scenarioNodesRoles = []
        this.scenarioRawData = undefined

        // all related to script management
        this.scriptPerPage = 10
        this.scriptPageNum = 1
        this.scriptPageMax = 1
        this.scriptFiltered = []

    }

    set name(name) { this.scenarioName = name }
    set description(description) { this.scenarioDescription = description }
    set scripts(scripts) { this.scenarioScripts = scripts }
    set nodes(nodes) { this.scenarioNodes = nodes }
    set ansibleFirst(ansibleFirst) { this.scenarioAnsibleFirst = ansibleFirst }
    set parallelMode(parallelMode) { this.scenarioParallelMode = parallelMode }
    set nodesRoles(roles) { this.scenarioNodesRoles = roles }
    set rawData(rData) { this.scenarioRawData = rData }

    set scenarioScriptPerPage(SPP) { this.scriptPerPage = SPP }
    set scenarioScriptPageNum(SPN) { this.scriptPageNum = SPN }
    set scenarioScriptPageMax(SPM) { this.scriptPageMax = SPM }
    set scenarioScriptFiltered(SMF) { this.scriptFiltered = SMF }

    get name() { return this.scenarioName }
    get description() { return this.scenarioDescription }
    get scripts() { return this.scenarioScripts }
    get nodes() { return this.scenarioNodes }
    get ansibleFirst() { return this.scenarioAnsibleFirst }
    get parallelMode() { return this.scenarioParallelMode }
    get nodesRoles() { return this.nodesRoles }
    get rawData() { return this.scenarioRawData }

    get scenarioScriptPerPage() { return this.scriptPerPage }
    get scenarioScriptPageNum() { return this.scriptPageNum }
    get scenarioScriptPageMax() { return this.scriptPageMax }
    get scenarioScriptFiltered() { return this.scriptFiltered }

    add = function(scenarios) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/scenarios',
                type: "POST",
                headers: {'Authorization': config.session.httpToken},
                data: JSON.stringify({"scenarios": scenarios}),
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

    list() {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/scenarios',
                type: "GET",
                headers: {"Authorization": config.session.httpToken},
                success: function(Resp) {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logoutAccount()
                        } else { resolve(Resp) }
                }
            })
        })
    }

    listByIds(scenarioIds) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/scenarios/ids',
                type: "GET",
                data: {"ids": scenarioIds},
                headers: {"Authorization": config.session.httpToken},
                success: function(Resp) {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logoutAccount()
                        } else { resolve(Resp) }
                }
            })
        })
    }

    listByScriptRunId(scriptRunId) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realm/' + config.session.realm + '/management/scriptrun/' + scriptRunId,
                type: "GET",
                headers: {"Authorization": config.session.httpToken},
                success: function(Resp) {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logoutAccount()
                        } else { resolve(Resp) }
                }
            })
        })
    }

    loadTreeSource = function() {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realm/' + config.session.realm + '/scenarios/tree',
                type: "GET",
                headers: {"Authorization": config.session.httpToken},
                success: function (Resp) {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if ("tokenExpired" in Resp) { account.logoutAccount()
                        } else { resolve(Resp) }
                }
            })
        })
    }

    execScript(scenario) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/scenarios/execute',
                type: "POST",
                headers: {"Authorization": config.session.httpToken},
                data: JSON.stringify(scenario),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (Resp) {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if ("tokenExpired" in Resp) {
                        account.logoutAccount() } else { resolve(Resp) }
                }
            })
        })
    }

    runScenario = (formData) => {
        // this.scripts = await this.runScriptsId()
        // this.nodes = await this.runNodesId()
        // this.setFormData()
        console.log(formData)
        if (formData["nodes"].length > 0 && formData["scripts"].length > 0) {
            this.execScript(formData).then(function(scriptRunResult) {
                console.log("return")
            })
        }
    }

    getFormData() {
        return {
            "name" : this.name,
            "description" : this.description,
            "scripts" : this.scripts,
            "nodes" : this.nodes,
            "ansibleFirst": this.ansibleFirst,
            "parallelMode": this.execMode
        }
    }

    rolesSelectedNodes() {
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

    async saveScenario(formData) {
        this.add([formData]).then(function(res) { console.log(res) })
    }

}

let sce = new Scenario()

const loadScriptSessManagement = function() {
    return new Promise(function(resolve, reject) {
        let docStart = (sce.ManagementSamplePageNum - 1)  * sce.ManagementSamplePerPage
        let docEnd = sce.ManagementSamplePageNum * sce.ManagementSamplePerPage
        let delta = sce.ManagementSampleIntervalPicker * sce.ManagementSampleIntervalCounter
        sce.listSessByTimeAndPageRange(delta, docStart, docEnd).then(function(data) {
            console.log(data)
            resolve(data)
        })
    })
}

/* update the select and search script window of the management page
 * add script list core data
 * add script list navigation control
 */
const loadScenarioScriptUIHeader = function() {
    script.listLang().then(function(scriptLangsData) {
        windower.scriptSelectAndSearchWindow("managementUIScriptFrame", scriptLangsData["hits"]["hits"])
    })
}

const loadScenarioScriptUICore = function() {
    let pageLength = $("select#scriptSelSamplePerPage option:selected").val()
    script.list().then(function(scriptData) {
        windower.scriptSelectAndSearchWindowData(pageLength, scriptData["hits"]["hits"])
    })
}

const loadScenarioScriptUI = function() {
    let pageLength = $("select#scriptSelSamplePerPage option:selected").val()
    script.list().then(function(scriptData) {
        if ( scriptData["hits"]["total"]["value"] > 0) {
            loadScenarioScriptUIHeader()
            loadScenarioScriptUICore()
        } else { $("#managementUIScriptFrame").html(msgScriptNotFound) }
    })
}


const scriptSelectAndSearchGoToPrevPage = function(pageNum) {
    script.list().then(function(objectData) {
        windower.scriptSelectAndSearchGoToPrevPage(pageNum, objectData["hits"]["hits"])
    })
}

const scriptSelectAndSearchGoToThisPage = function(pageNum) {
    script.list().then(function(objectData) {
        windower.scriptSelectAndSearchGoToThisPage(pageNum, objectData["hits"]["hits"])
    })
}

const scriptSelectAndSearchGoToNextPage = function(pageNum, lastPage) {
    script.list().then(function(objectData) {
        windower.scriptSelectAndSearchGoToNextPage(pageNum, lastPage, objectData["hits"]["hits"])
    })
}

const loadManagementUI = function() {
    managementFilter.managementWindow('managementFrame')
    management.list().then(function(managementData) {
        managementFilter.managementWindowCoreData('undefined', managementData["hits"]["hits"])
    })
}


/* GLOBAL PAGE FUNCTIONS */
const loadScenarioUI = function() {
    // loadScenarioScriptUI()
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