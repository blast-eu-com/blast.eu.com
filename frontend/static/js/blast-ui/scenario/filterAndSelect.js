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

var ScenarioFilterAndSelect = class {

    constructor(parentName) {
        this.parentName = parentName
        this.frame = `
            <div class="input-group">
                <div class="input-group-text"><img src="/img/bootstrap-icons-1.0.0-alpha5/search.svg" /></div>
                <input class="form-control form-control-sm" id="scenarioNameSearch" type="text" placeholder="Search a scenario" />
                <button class="btn blast-btn btn-sm" onclick="searchScenarioByName();">Search</button>
            </div>
            <div id="simpleWindowFrameCore" class="mt-2"></div>
            <div id="simpleWindowInteractive" class="row p-1 m-1"></div>
        `
    }

    addFrame() {
        $('#' + this.parentName).html(this.frame)
    }

    scenarioStringSearch() {
        return $("input#scenarioNameSearch").val()
    }

    templateScenario = (scenarioData) => {
        let html = '<table class="table"><tr>'
        scenarioData.forEach((sce) => {
            html = html + `
            <tr style="display:table-row">
                <td width="50px"><input name="scenario" value="` + sce["_id"] + `" type="checkbox" style="margin-left: 10px;"/></td>
                <td width="50px"><img src="/img/bootstrap-icons/terminal.svg" height="24" width="24"/></td>
                <td width="512px"><a href="/html/scenario-details.html?id=` + sce["_id"] + `">` + sce["_source"]["name"] + `</a></td>
                <td>` + sce["_source"]["description"] + `</td>
            </tr>`
        })
        return html
    }

    loadScenario = () => {
        // let scenarioName = this.scenarioStringSearch()
        scenario.list().then((scenarioData) => {
            $("#simpleWindowInteractive").pagination({
                dataSource: scenarioData["hits"]["hits"],
                pageSize: 60,
                callback: (data, pagination) => {
                    let html = this.templateScenario(data)
                    $("#simpleWindowFrameCore").html(html)
                }
            })
        })
    }

    loadScenarioByName = () => {
        let scenarioName = this.scenarioStringSearch()
        scenario.searchByName(scenarioName).then((scenarioData) => {
            $("#simpleWindowInteractive").pagination({
                dataSource: scenarioData["hits"]["hits"],
                pageSize: 60,
                callback: (data, pagination) => {
                    let html = this.templateScenario(data)
                    $("#simpleWindowFrameCore").html(html)
                }
            })
        })
    }

    // return the filter and select window
    render = () => {
        this.addFrame()
        this.loadScenario()
    }

}

export default ScenarioFilterAndSelect