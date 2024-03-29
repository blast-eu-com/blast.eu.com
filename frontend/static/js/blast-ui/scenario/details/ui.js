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

import Scenario from '../../../scenario.js'
import ScenarioListInfo from './listInfo.js'

var scenario = new Scenario()
var scenarioListInfo = new ScenarioListInfo()

const setPageTitle = (scenarioName) => {
    $("#navScenarioName").html(scenarioName)
}

async function main() {
    let urlParams = new URLSearchParams(window.location.href.split('?')[1])
    if (urlParams.has("id")) {
        let scenario_id = urlParams.get("id")
        let scenarioData = await scenario.listByIds([scenario_id])
        scenario.load(scenarioData["hits"]["hits"][0])
        setPageTitle(scenario.name)
        scenarioListInfo.render("scenarioListInfo", scenario)
    }
}

window.main = main