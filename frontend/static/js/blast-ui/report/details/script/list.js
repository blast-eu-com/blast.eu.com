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

const ReportScriptList = class {

    constructor() {
        this._frame = `
            <ul id="reporterScriptListSection" class="list-group">
                <li class="list-group-item border-top-0 border-start-0 border-end-0" style="font-size: 14px">
                    <div class="row">
                        <div class="col-3">Start At</div>
                        <div class="col-3">Execution Id</div>
                        <div class="col-3">Name</div>
                        <div class="col-3">Description</div>
                    </div>
                </li>
                <li id="reporterScriptListContainer" class="border-0" style='overflow-y: scroll; height: 1000px; padding-left: 0'>
                    <ul id="reporterScriptList" style="padding-left: 0"></ul>
                    <div id="reporterScriptListBottom" class="card rounded-0" style="display: hidden">
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

    addSubFrame = (scriptData) => {
        let scriptEl = document.createElement("li")
        scriptEl.classList.add("list-group-item")
        scriptEl.classList.add("p-0")
        scriptEl.id = "list_element_" + scriptData["_id"]
        scriptEl.style.cssText = "font-size: 12px; border-left: 1px solid #DADEDF; border-right: 1px solid #DADEDF; border-bottom: 1px solid #DADEDF"
        let list = document.getElementById("reporterScriptList")
        list.appendChild(scriptEl)
        let content = `
             <div class="card border-0">
                        <div class="card-body">
                            <div class="card-title mouseHover" data-bs-toggle="collapse" href="#report_` + scriptData["_id"] + `"
                                aria-expanded="false" aria-controls="report_` + scriptData["_id"] + `">
                                <div class="row">
                                    <div class="col-3">` + scriptData["_source"]["start_at"] + `</div>
                                    <div class="col-3">` + scriptData["_source"]["execution_id"] + `</div>
                                    <div class="col-3">` + scriptData["_source"]["name"] + `</div>
                                    <div class="col-3">` + scriptData["_source"]["description"] + `</div>
                                </div>
                            </div>
                            <div id="report_` + scriptData["_id"] + `" class="collapse">
                                <div class="card rounded-0 border-start-0 border-bottom-0 border-end-0" style="font-size: 12px; border-top: 1px solid #D7D7D7">
                                    <div class="card-body">
                                        <div id="script_exec_` + scriptData["_id"] + `">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
        `
        scriptEl.innerHTML = content
    }

    addSubFrameContent = (scriptData) => {
        let html = ''
        let output = ''
        $.each(scriptData["_source"], (idx, value) => {
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
                    <div class="row ms-2 p-2">
                        <div class="col-12">
                            <div>output</div>
                            <div class="p-1">
                                <code>
                                    <pre style="font-size: 12px; color: #212529">`
                                        + scriptData["_source"]["output"] +
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
        $("#script_exec_" + scriptData["_id"]).html(`<div id="scenarioContent">` + html + output + `</div>`)
    }

    addReporterList = (scriptData) => {
        this.addSubFrame(scriptData)
        this.addSubFrameContent(scriptData)
    }

    expandReporterList = () => {
        console.log(this.reportDataScrollId)
        filterScrollData('script', this.reportDataScrollId).then((reportData) => {
            this.reportData = reportData["hits"]["hits"]
            this.reportDataScrollId = reportData["_scroll_id"]
            this.reportData.forEach((scriptData) => {
                this.addReporterList(scriptData)
            })
        })
    }

    render = (parentName, formData) => {
        this.parentName = parentName
        this.addFrame()
        filterScroll(formData).then((reportData) => {
            this.reportData = reportData["hits"]["hits"]
            this.reportDataScrollId = reportData["_scroll_id"]
            console.log(this.reportDataScrollId)
            this.reportData.forEach((scriptData) => {
                this.addReporterList(scriptData)
            })
        })

        let options = {
            "root": document.querySelector("#reporterScriptListContainer"),
            "rootMargin": '5px',
            "threshold": 0.1
        }
        let observer = new IntersectionObserver(this.expandReporterList, options)
        let target = document.querySelector("#reporterScriptListBottom")
        observer.observe(target)
    }
}

export default ReportScriptList
