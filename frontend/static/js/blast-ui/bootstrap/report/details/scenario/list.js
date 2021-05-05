/*
   Copyright 2020 Jerome DE LUCCHI

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

import Reporter from '../../../../../reporter.js'

var reporter = new Reporter()

const ReportScenarioList = class {

    constructor() {

        this._parentName = undefined
        this._executionId = undefined
        this._tagId = undefined
        this._reportId = undefined
        this._scenarioData = undefined
        this._reportScenarioFrame = undefined
        this._frame = `
            <div class="card rounded-0 border-start-0 border-bottom-0 border-end-0" style="font-size: 12px; border-top: 1px solid #D7D7D7">
                <div class="card-body">
                    <div id="scenario_exec_%tagId%" class"collapse"></div>
                </div>
            </div>
        `
    }

    set parentName(pn) { this._parentName = pn }
    set reportScenarioFrame(rsf) { this._reportScenarioFrame = rsf }
    set frame(fr) { this._frame = fr }
    set tagId(ti) { this._tagId = ti }
    set reportId(ri) { this._reportId = ri }
    set executionId(id) { this._executionId = id }
    set scenarioData(sd) { this._scenarioData = sd }

    get parentName() { return this._parentName }
    get reportScenarioFrame() { return this._reportScenarioFrame }
    get frame() { return this._frame }
    get tagId() { return this._tagId }
    get reportId() { return this._reportId }
    get executionId() { return this._executionId }
    get scenarioData() { return this._scenarioData }

    addFrame = () => {
        let html = $("#" + this.parentName).html()
        $("#" + this.parentName).html(html + this.frame.replace(/%tagId%/g, this.tagId))
        console.log('reportScenarioList', this.parentName, html)
    }

    addReportScenario = () => {
        let html = ''
        $.each(this.scenarioData["_source"], (idx, value) => {
            if (idx === "duration") {
                $.each(value, (durationIdx, durationValue) => {
                    idx = 'duration.' + durationIdx
                    value = durationValue
                    html = html + `
                        <div class="row ms-2 p-2">
                            <div class="col-2">` + idx + `</div>
                            <div class="col-8">` + value + `</div>
                        </div>`
                })
            } else {
                html = html + `
                    <div class="row ms-2 p-2">
                        <div class="col-2">` + idx + `</div>
                        <div class="col-8">` + value + `</div>
                    </div>`
            }
        })
        $("#scenario_exec_" + this.tagId).html(`<div id="scenarioContent">` + html + `</div>`)
    }

    addReportScenarioScripts = (scriptId) => {
        reportScriptList.render('scenario_' + this.scenarioId + 'scripts', scriptId)
    }

    render = (parentName, reportId, executionId) => {
        this.parentName = parentName
        $("#" + parentName).html('')
        this.reportId = reportId
        console.log('scenario report id:',  this.reportId)
        this.executionId = executionId
        console.log('reportScenarioList', this.executionId)
        let filterReport = {
            "time": {
                "interval": {
                    "value": "",
                    "unit": "",
                    "selected": false
                },
                "datetime": {
                    "start_at": "",
                    "end_at": "",
                    "selected": false
                }
            },
            "object": {
                "name": "scenario"
            },
            "search": [
                {
                    "field": "execution_id",
                    "string": this.executionId
                }
            ]
        }

        reporter.filter_scroll(filterReport).then((scenarios) => {
            scenarios["hits"]["hits"].forEach((sce) => {
                this.scenarioData = sce
                this.tagId = this.scenarioData["_id"]
                console.log('scenario tag id:', this.tagId)
                if ( this.tagId === this.reportId ) {
                    this.addFrame()
                    this.addReportScenario()
                }
            })
        })
    }

}

export default ReportScenarioList