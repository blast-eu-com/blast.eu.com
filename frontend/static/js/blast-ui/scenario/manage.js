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

import Scenario from '../../scenario.js'

var scenario = new Scenario()


const ScenarioManage = class {

    constructor(parentName) {
        this.parentName = parentName
        this.frame = `
            <div id="scenarioContainer"></div>
            <div id="scenarioPaginationContainer"></div>
        `

    }

    addFrame = () => {
        $("#" + this.parentName).html(this.frame)
        console.log(this.parentName)
    }

    templateScenario = (scenarioData) => {

        var html = `<table class="table">`
        scenarioData.forEach((sce) => {
            html = html + `<tr>
            <td style="vertical-align: middle;"><img src="/img/object/scenario.svg" height="24px" width="24px" /></td>
            <td style="vertical-align: middle;">` + sce["_source"]["name"] + `</td>
            <td style="vertical-align: middle;">` + sce["_source"]["description"] + `</td>
            <td style="vertical-align: middle;"><a class="blast-btn btn" onclick="runSavedScenario('` + scenario["_id"] + `')">Run</a></td>
            </tr>`
        })
        return html
    }

    loadScenario = () => {
        scenario.list().then((scenarioData) => {
            $("#scenarioPaginationContainer").pagination({
                dataSource: scenarioData["hits"]["hits"],
                pageSize: 5,
                callback: (data, pagination) => {
                    let html = this.templateScenario(data)
                    $("#scenarioContainer").html(html)
                }
            })
        })
    }

    render = () => {
        this.addFrame()
        this.loadScenario()
    }

}

export default ScenarioManage