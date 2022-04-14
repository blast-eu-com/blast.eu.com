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

import ScenarioForm from './form.js'
import ScenarioNodesTree from './nodesTree.js'
import ScenarioLast from './last.js'
import ScenarioManage from './manage.js'
import ScriptFilterAndSelect from '../script/filterAndSelect.js'
import Scenario from '../../scenario.js'
import Toast from '../main/notification/toast.js'
import {dictionary} from '../main/message/en/dictionary.js'

var scenarioForm = new ScenarioForm('scenarioFormContainer')
var scenarioNodesTree = new ScenarioNodesTree('scenarioNodesTree')
var scenarioManage = new ScenarioManage('scenarioManager')
var scenarioLast = new ScenarioLast('scenarioLast')
var scriptFilterAndSelect = new ScriptFilterAndSelect('managementUIScriptFrame')
var scenario = new Scenario()
var toast = new Toast()

toast.msgPicture = '../../../img/object/scenario.svg'

const saveScenario = async () => {
    scenarioForm.setFormData()
    scenarioForm.formData["nodes"] = await scenarioNodesTree.runNodesId()
    scenarioForm.formData["scripts"] = await scriptFilterAndSelect.runScriptsId()
    let actionRes, scenarioData = scenarioForm.formData
    scenario.add(scenarioData).then((Resp) => {
        if (Resp["result"] === "created") {
            toast.msgTitle = "Scenario create Success"
            toast.msgText = dictionary["scenario"]["add"].replace('%scenarioName%', scenarioData["name"])
            actionRes = "success"
        } else if ( Object.keys(Resp).includes("failure") ) {
            toast.msgTitle = "Scenario create Failure"
            toast.msgText = Resp["failure"]
            actionRes = "failure"
        }
        toast.notify(actionRes)
        setTimeout(() => { location.reload() }, 2000)
    })
}

const runOneShotScenario = async () => {
    let actionRes, scenarioData = scenarioForm.setFormData()
    scenarioForm.formData["nodes"] = await scenarioNodesTree.runNodesId()
    scenarioForm.formData["scripts"] = await scriptFilterAndSelect.runScriptsId()
    scenario.execute(scenarioForm.formData).then((Resp) => {
        if (Resp["result"] === "created") {
            toast.msgTitle = "Scenario execute Success"
            toast.msgText = "Scenario execute"
            actionRes = "success"
        } else if ( Object.keys(Resp).includes("failure") ) {
            toast.msgTitle = "Scenario execute Failure"
            toast.msgText = Resp["failure"]
            actionRes = "failure"
        }
        toast.notify(actionRes)
        setTimeout(() => { location.reload() }, 2000)
    })
}

const runSavedScenario = async (scenarioId) => {
    let actionRes, scenarioData, sce = await scenario.listById(scenarioId)
    scenarioData = sce["hits"]["hits"][0]["_source"]
    scenarioData["scenario_id"] = scenarioId
    scenario.execute(scenarioData).then((Resp) => {
        if (Resp["result"] === "created") {
            toast.msgTitle = "Scenario execute Success"
            toast.msgText = "Scenario execute"
            actionRes = "success"
        } else if ( Object.keys(Resp).includes("failure") ) {
            toast.msgTitle = "Scenario execute Failure"
            toast.msgText = Resp["failure"]
            actionRes = "failure"
        }
        toast.notify(actionRes)
        setTimeout(() => { location.reload() }, 2000)
    })
}


function main() {

    scenarioForm.render()
    scenarioNodesTree.render()
    scriptFilterAndSelect.render()
    scenarioLast.render()
    scenarioManage.render()
}

window.main = main
window.oneShotScenario = runOneShotScenario
window.runSavedScenario = runSavedScenario
window.saveScenario = saveScenario
window.switchScenarioReportLast = scenarioLast.switchScenarioReportLast
window.scriptSearchString = scriptFilterAndSelect.filterScript
window.scriptSelectAndSearchGoToPrevPage = scriptFilterAndSelect.scriptSelectAndSearchGoToPrevPage
window.scriptSelectAndSearchGoToThisPage = scriptFilterAndSelect.scriptSelectAndSearchGoToThisPage
window.scriptSelectAndSearchGoToNextPage = scriptFilterAndSelect.scriptSelectAndSearchGoToNextPage