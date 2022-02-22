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

import { filterScroll, filterScrollData } from '../../../../reporter.js'

const ReportScenarioList = class {

    constructor() {
        this._frame = `
            <ul id="reporterScenarioListSection" class="list-group">
                <li class="list-group-item border-top-0 border-start-0 border-end-0" style="font-size: 14px">
                    <div class="row">
                        <div class="col-3">Start At</div>
                        <div class="col-3">Execution Id</div>
                        <div class="col-3">Name</div>
                        <div class="col-3">Description</div>
                    </div>
                </li>
                <li id="reporterScenarioListContainer" class="border-0" style='overflow-y: scroll; height: 1000px; padding-left: 0'>
                    <ul id="reporterScenarioList" style="padding-left: 0"></ul>
                    <div id="reporterScenarioListBottom" class="card rounded-0" style="display: hidden">
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

    addSubFrame = (scenarioData) => {
        let scenarioEl = document.createElement("li")
        scenarioEl.classList.add("list-group-item")
        scenarioEl.classList.add("p-0")
        scenarioEl.id = "list_element_" + scenarioData["_id"]
        scenarioEl.style.cssText = "font-size: 12px; border-left: 1px solid #DADEDF; border-right: 1px solid #DADEDF; border-bottom: 1px solid #DADEDF"
        let list = document.getElementById("reporterScenarioList")
        list.appendChild(scenarioEl)
        let content = `
             <div class="card border-0">
                        <div class="card-body">
                            <div class="card-title mouseHover" data-bs-toggle="collapse" href="#report_` + scenarioData["_id"] + `"
                                aria-expanded="false" aria-controls="report_` + scenarioData["_id"] + `">
                                <div class="row">
                                    <div class="col-3">` + scenarioData["_source"]["start_at"] + `</div>
                                    <div class="col-3">` + scenarioData["_source"]["execution_id"] + `</div>
                                    <div class="col-3">` + scenarioData["_source"]["name"] + `</div>
                                    <div class="col-3">` + scenarioData["_source"]["description"] + `</div>
                                </div>
                            </div>
                            <div id="report_` + scenarioData["_id"] + `" class="collapse">
                                <div class="card rounded-0 border-start-0 border-bottom-0 border-end-0" style="font-size: 12px; border-top: 1px solid #D7D7D7">
                                    <div class="card-body">
                                        <div id="scenario_exec_` + scenarioData["_id"] + `">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
        `
        scenarioEl.innerHTML = content
    }

    addSubFrameContent = (scenarioData) => {
        let html = ''
        $.each(scenarioData["_source"], (idx, value) => {
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
        $("#scenario_exec_" + scenarioData["_id"]).html(`<div id="scenarioContent">` + html + `</div>`)
    }

    addReporterList = (scenarioData) => {
        this.addSubFrame(scenarioData)
        this.addSubFrameContent(scenarioData)
    }

    expandReporterList = () => {
        filterScrollData('scenario', this.reportDataScrollId).then((reportData) => {
            this.reportData = reportData["hits"]["hits"]
            this.reportDataScrollId = reportData["_scroll_id"]
            this.reportData.forEach((scenarioData) => { this.addReporterList(scenarioData) })
        })
    }

    render = async (parentName, formData) => {
        this.parentName = parentName
        this.addFrame()
        let reportData = await filterScroll(formData)
        this.reportData = reportData["hits"]["hits"]
        this.reportDataScrollId = reportData["_scroll_id"]
        this.reportData.forEach((scenarioData) => { this.addReporterList(scenarioData) })

        let options = {
            "root": document.querySelector("#reporterScenarioListContainer"),
            "rootMargin": '5px',
            "threshold": 0.1
        }
        let observer = new IntersectionObserver(this.expandReporterList, options)
        let target = document.querySelector("#reporterScenarioListBottom")
        observer.observe(target)
    }
}



export default ReportScenarioList