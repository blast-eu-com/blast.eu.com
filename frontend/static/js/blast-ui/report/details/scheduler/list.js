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

import { filterScroll, filterScrollData } from '../../../../../reporter.js'

const ReportSchedulerList = class {

    constructor() {
        this._frame = `
            <ul id="reporterSchedulerListSection" class="list-group">
                <li class="list-group-item border-top-0 border-start-0 border-end-0" style="font-size: 14px">
                    <div class="row">
                        <div class="col-3">Start At</div>
                        <div class="col-3">Execution Id</div>
                        <div class="col-3">Name</div>
                        <div class="col-3">Description</div>
                    </div>
                </li>
                <li id="reporterSchedulerListContainer" class="border-0" style='overflow-y: scroll; height: 1000px; padding-left: 0'>
                    <ul id="reporterSchedulerList" style="padding-left: 0"></ul>
                    <div id="reporterSchedulerListBottom" class="card rounded-0" style="display: hidden">
                        <div class="card-body"></div>
                    </div>
                </li>
            </ul>
        `

        this._parentName = undefined
        this._reportData = undefined
        this._reportDataScrollId = undefined
    }

    set parentName(pn) { this._parentName = pn }
    set reportData(rd) { this._rd = rd }
    set reportDataScrollId(rdsi) { this._reportDataScrollId = rdsi }

    get parentName() { return this._parentName }
    get reportData() { return this._rd }
    get reportDataScrollId() { return this._reportDataScrollId }

    addFrame = () => {
        $("#" + this.parentName).html(this._frame)
    }

    addSubFrame = (schedulerData) => {
        let schedulerEl = document.createElement("li")
        schedulerEl.classList.add("list-group-item")
        schedulerEl.classList.add("p-0")
        schedulerEl.id = "list_element_" + schedulerData["_id"]
        schedulerEl.style.cssText = "font-size: 12px; border-left: 1px solid #DADEDF; border-right: 1px solid #DADEDF; border-bottom: 1px solid #DADEDF"
        let list = document.getElementById("reporterSchedulerList")
        list.appendChild(schedulerEl)
        let content = `
             <div class="card border-0">
                        <div class="card-body">
                            <div class="card-title mouseHover" data-bs-toggle="collapse" href="#report_` + schedulerData["_id"] + `"
                                aria-expanded="false" aria-controls="report_` + schedulerData["_id"] + `">
                                <div class="row">
                                    <div class="col-3">` + schedulerData["_source"]["start_at"] + `</div>
                                    <div class="col-3">` + schedulerData["_source"]["execution_id"] + `</div>
                                    <div class="col-3">` + schedulerData["_source"]["name"] + `</div>
                                    <div class="col-3">` + schedulerData["_source"]["description"] + `</div>
                                </div>
                            </div>
                            <div id="report_` + schedulerData["_id"] + `" class="collapse">
                                <div class="card rounded-0 border-start-0 border-bottom-0 border-end-0" style="font-size: 12px; border-top: 1px solid #D7D7D7">
                                    <div class="card-body">
                                        <div id="scheduler_exec_` + schedulerData["_id"] + `">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
        `
        schedulerEl.innerHTML = content
    }

    addSubFrameContent = (schedulerData) => {
        let html = ''
        $.each(schedulerData["_source"], (idx, value) => {
            if ( idx === "duration" ) {
                $.each(value, (durationIdx, durationValue) => {
                    idx = "duration." + durationIdx
                    value = durationValue
                    html = html + `
                        <div class="row ms-2 p-2 border-bottom">
                            <div class="col-3">` + idx + `</div>
                            <div class="col-8">` + value + `</div>
                        </div>`
                })
            } else {
                html = html + `
                    <div class="row ms-2 p-2 border-bottom">
                        <div class="col-3">` + idx + `</div>
                        <div class="col-8">` + value + `</div>
                    </div>`
            }
        })
        $("#scheduler_exec_" + schedulerData["_id"]).html(`<div id="scenarioContent">` + html + `</div>`)
    }

    addReporterList = (schedulerData) => {
        this.addSubFrame(schedulerData)
        this.addSubFrameContent(schedulerData)
    }

    expandReporterList = () => {
        filterScrollData('scheduler', this.reportDataScrollId).then((reportData) => {
            this.reportData = reportData["hits"]["hits"]
            this.reportDataScrollId = reportData["_scroll_id"]
            this.reportData.forEach((schedulerData) => {
                this.addReporterList(schedulerData)
            })
        })
    }

    render = (parentName, formData) => {
        this.parentName = parentName
        this.addFrame()
        console.log(formData)
        filterScroll(formData).then((reportData) => {
            this.reportData = reportData["hits"]["hits"]
            this.reportDataScrollId = reportData["_scroll_id"]
            this.reportData.forEach((schedulerData) => {
                this.addReporterList(schedulerData)
            })
        })

        let options = {
            "root": document.querySelector("#reporterSchedulerListContainer"),
            "rootMargin": '5px',
            "threshold": 1
        }
        let observer = new IntersectionObserver(this.expandReporterList, options)
        let target = document.querySelector("#reporterSchedulerListBottom")
        observer.observe(target)
    }
}

export default ReportSchedulerList