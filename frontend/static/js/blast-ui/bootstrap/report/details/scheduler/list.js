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

const ReportSchedulerList = class {

    constructor() {
        this._executionId = undefined
        this._frame = `
            <div class="card rounded-0 border-start-0 border-bottom-0 border-end-0" style="font-size: 12px; border-top: 1px solid #D7D7D7">
                <div class="card-body">
                    <div id="scheduler_exec_%tagId%" class"collapse"></div>
                </div>
            </div>
        `
        this._reportId = undefined
        this._reportSchedulerFrame = undefined
        this._schedulerData = undefined
        this._tagId = undefined
        this._parentName = undefined
    }

    set executionId(ei) { this._executionId = ei }
    set frame(fr) { this._frame = fr }
    set parentName(pn) { this._parentName = pn }
    set reportId(ri) { this._reportId = ri }
    set reportSchedulerFrame(rsf) { this._reportSchedulerFrame = rsf }
    set schedulerData(sd) { this._schedulerData = sd }
    set tagId(ti) { this._tagId = ti }

    get executionId() { return this._executionId }
    get frame() { return this._frame }
    get parentName() { return this._parentName }
    get reportId() { return this._reportId }
    get reportSchedulerFrame() { return this._reportSchedulerFrame }
    get schedulerData() { return this._schedulerData }
    get tagId() { return this._tagId }

    addFrame = () => {
        let html = $("#" + this.parentName).html()
        $("#" + this.parentName).html(html + this.frame.replace(/%tagId%/g, this.tagId))
    }

    addReportScheduler = () => {
        let html = ''
        $.each(this.schedulerData["_source"], (idx, value) => {
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
            } else {
                html = html + `
                    <div class="row ms-2 p-2">
                        <div class="col-2">` + idx + `</div>
                        <div class="col-8">` + value + `</div>
                    </div>`
            }
        })
        $("#scheduler_exec_" + this.tagId).html(`<div id="scenarioContent">` + html + `</div>`)
    }

    render = (parentName, reportId, executionId) => {
        this.parentName = parentName
        $("#" + this.parentName).html('')
        this.reportId = reportId
        this.executionId = executionId
        console.log('reportSchedulerList', this.executionId)
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
                "name": "scheduler"
            },
            "search": [
                {
                    "field": "execution_id",
                    "string": this.executionId
                }
            ]
        }

        reporter.filter_scroll(filterReport).then((schedulers) => {
            schedulers["hits"]["hits"].forEach((sched) => {
                this.schedulerData = sched
                this.tagId = this.schedulerData["_id"]
                if ( this.tagId === this.reportId ) {
                    this.addFrame()
                    this.addReportScheduler()
                }
            })
        })

    }

}

export default ReportSchedulerList