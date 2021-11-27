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

import ScenarioForm from './form.js'
import ScenarioNodesTree from './nodesTree.js'
import ScenarioLast from './last.js'
import ScriptFilterAndSelect from '../script/filterAndSelect.js'

var scenarioForm = new ScenarioForm('scenarioForm')
var scenarioNodesTree = new ScenarioNodesTree('scenarioNodesTree')
var scenarioLast = new ScenarioLast('scenarioLast')
var scriptFilterAndSelect = new ScriptFilterAndSelect('managementUIScriptFrame')

function main() {

    scenarioForm.render(scenarioNodesTree, scriptFilterAndSelect)
    scenarioNodesTree.render()
    scriptFilterAndSelect.render()
    scenarioLast.render()
}

window.main = main
window.oneShotScenario = scenarioForm.oneShotScenario
window.saveScenario = scenarioForm.saveScenario
window.switchScenarioReportLast = scenarioLast.switchScenarioReportLast
window.scriptSelectAndSearchGoToPrevPage = scriptFilterAndSelect.scriptSelectAndSearchGoToPrevPage
window.scriptSelectAndSearchGoToThisPage = scriptFilterAndSelect.scriptSelectAndSearchGoToThisPage
window.scriptSelectAndSearchGoToNextPage = scriptFilterAndSelect.scriptSelectAndSearchGoToNextPage