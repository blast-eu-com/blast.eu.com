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

    add = (scenarios) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/scenarios',
                type: "POST",
                headers: {'Authorization': config.session.httpToken},
                data: JSON.stringify({"scenarios": scenarios}),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: (Resp) => {
                    if ( typeof Resp === 'string' ) {
                        Resp = JSON.parse(Resp)
                        if (Object.keys(Resp).includes("tokenExpired")) {
                            account.logout()
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

    list() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/scenarios',
                type: "GET",
                headers: {"Authorization": config.session.httpToken},
                success: (Resp) => {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) {
                        account.logout()
                    } else { resolve(Resp) }
                }
            })
        })
    }

    listByIds(scenarioIds) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/scenarios/ids',
                type: "GET",
                data: {"ids": scenarioIds},
                headers: {"Authorization": config.session.httpToken},
                success: (Resp) => {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) {
                        account.logout()
                    } else { resolve(Resp) }
                }
            })
        })
    }

    listByScriptRunId(scriptRunId) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/realm/' + config.session.realm + '/management/scriptrun/' + scriptRunId,
                type: "GET",
                headers: {"Authorization": config.session.httpToken},
                success: (Resp) => {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) {
                        account.logout()
                    } else { resolve(Resp) }
                }
            })
        })
    }

    execScript(scenario) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/scenarios/execute',
                type: "POST",
                headers: {"Authorization": config.session.httpToken},
                data: JSON.stringify(scenario),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: (Resp) => {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if ("tokenExpired" in Resp) {
                        account.logout()
                    } else { resolve(Resp) }
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
            this.execScript(formData).then((scriptRunResult) => {
                console.log("return")
            })
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

    saveScenario = async (formData) => {
        this.add([formData]).then((res) => { console.log(res) })
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