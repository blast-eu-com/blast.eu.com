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
            <div id="scenarioContainer" class="col-12 p-0">
                <div class="card blast-card shadow-sm h-100 rounded">
                    <div class="card-header blast-card-header">Manage scenario</div>
                    <div id="scenarioManageContainer" class="card-body"></div>
                    <div id="scenarioPaginationContainer" class="card-footer blast-card-footer"></div>
                </div>
            </div>
        `
    }

    addFrame = () => {
        $("#" + this.parentName).html(this.frame)
    }

    templateScenario = (scenarioData) => {

        var html = `<table class="table table-sm" style="font-size: small;">
        <thead><tr><th></th><th>Name</th><th>Description</th><th>Action</th></tr></thead>`

        scenarioData.forEach((sce) => {
            html = html + `<tr>
            <td style="vertical-align: middle;"><img src="/img/object/scenario.svg" height="24px" width="24px" /></td>
            <td style="vertical-align: middle;"><a href="/html/scenario-details.html?id=` + sce["_id"] + `">` + sce["_source"]["name"] + `</a></td>
            <td style="vertical-align: middle;">` + sce["_source"]["description"] + `</td>
            <td style="vertical-align: middle;"><a class="blast-btn btn btn-sm" onclick="runSavedScenario('` + sce["_id"] + `')">Run</a></td>
            </tr>`
        })
        return html
    }

    loadScenario = () => {
        scenario.list().then((scenarioData) => {
            $("#scenarioPaginationContainer").pagination({
                dataSource: scenarioData["hits"]["hits"],
                pageSize: 25,
                callback: (data, pagination) => {
                    let html = this.templateScenario(data)
                    $("#scenarioManageContainer").html(html)
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