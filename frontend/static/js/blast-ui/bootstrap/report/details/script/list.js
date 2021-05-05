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

const ReportScriptList = class {

    constructor() {
        this._executionId = undefined
        this._frame = `
            <div class="card rounded-0 border-start-0 border-bottom-0 border-end-0" style="font-size: 12px; border-top: 1px solid #D7D7D7">
                <div class="card-body">
                    <div id="script_exec_%tagId%" class"collapse">
                    </div>
                </div>
            </div>
        `
        this._parentName = undefined
        this._reportId = undefined
        this._reportScriptFrame = undefined
        this._scriptData = undefined
    }

    set executionId(ei) { this._executionId = ei }
    set frame(fr) { this._frame = fr }
    set parentName(pn) { this._parentName = pn }
    set reportScriptFrame(rsf) { this._reportScriptFrame = rsf }
    set reportId(ri) { this._reportId = ri }
    set scriptData(sd) { this._scriptData = sd }

    get executionId() { return this._executionId }
    get frame() { return this._frame }
    get parentName() { return this._parentName }
    get reportId() { return this._reportId }
    get reportScriptFrame() { return this._reportScriptFrame }
    get scriptData() { return this._scriptData }

    addFrame = () => {
        let html = this.frame.replace(/%tagId%/g, this.tagId)
        $("#" + this.parentName).html(html)
    }

    addReportScript = () => {
        let html = ''
        let output = ''
        $.each(this.scriptData["_source"], (idx, value) => {
            if ( idx === "duration" ) {
                $.each(value, (durationIdx, durationValue) => {
                    idx = "duration." + durationIdx
                    value = durationValue
                    html = html + `
                        <div class="row ms-2 p-2">
                            <div class="col-2">` + idx + `</div>
                            <div class="col-8">` + value + `</div>
                        </div>`
                })
            } else if ( idx === "output" ) {
                output = `
                    <div class="row ms-2 p-2 bg-gradient" style="background-color: #CCC; border-radius: 5px">
                        <div class="col-12">
                            <div>output</div>
                            <div class="p-1">
                                <code>
                                    <pre style="font-size: 12px; color: #212529">`
                                        + this.scriptData["_source"]["output"] +
                                    `</pre>
                                </code>
                            </div>
                        </div>
                    <div>`
            } else {
                html = html + `
                    <div class="row ms-2 p-2">
                        <div class="col-2">` + idx + `</div>
                        <div class="col-8">` + value + `</div>
                    </div>`
            }
        })

        $("#script_exec_" + this.tagId).html(`<div id="scenarioContent">` + html + output + `</div>`)
    }

    render = (parentName, reportId, executionId) => {
        this.executionId = executionId
        this.parentName = parentName
        this.reportId = reportId
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
                "name": "script"
            },
            "search": [
                {
                    "field": "execution_id",
                    "string": this.executionId
                }
            ]
        }

        reporter.filter_scroll(filterReport).then((scripts) => {
            scripts["hits"]["hits"].forEach((scr) => {
                this.scriptData = scr
                this.tagId = this.scriptData["_id"]
                if ( this.reportId === this.tagId ) {
                    this.addFrame()
                    this.addReportScript()
                }
            })
        })



     }

}

export default ReportScriptList