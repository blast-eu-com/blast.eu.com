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

import ReportScenarioList from './details/scenario/list.js'
import ReportSchedulerList from './details/scheduler/list.js'
import ReportScriptList from './details/script/list.js'

var reportScenarioList = new ReportScenarioList()
var reportSchedulerList = new ReportSchedulerList()
var reportScriptList = new ReportScriptList()

const Reporting = class {

    constructor() {

        this.frame = `
            <div id="reporterChartContainer">
                <canvas class="mb-3" id="ObjectNameCanvas" width="400" height="100"></canvas>
            </div>
            <div id="reporterList">
                <div>
                    <ul id="reporterObjectNameListSection" class="list-group">
                        <li class="list-group-item border-top-0 border-start-0 border-end-0" style="font-size: 14px">
                            <div class="row">
                                <div class="col-3">Start At</div>
                                <div class="col-3">Execution Id</div>
                                <div class="col-3">Name</div>
                                <div class="col-3">Description</div>
                            </div>
                        </li>
                        <ul id="reporterObjectNameContentList" class="border-0" style='overflow-y: scroll; height: 1000px; padding-left: 0'></ul>
                    </ul>
                </div>
                <div></div>
            </div>
        `
        this._on = undefined
    }

    set objectName(on) { this._on = on }
    get objectName() { return this._on }

    addChart = () => {
        let ctx = $("#" + this.parentName + "Canvas")
        let data = []

        this.reporterData["aggregations"]["time"]["buckets"].forEach((bucket) => {
            data.push({"x": bucket["key_as_string"], "y": bucket["doc_count"]})
        })

        if ( this.chart !== undefined ) { this.chart.destroy() }

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                datasets: [{
                    data: data,
                    backgroundColor: "rgb(75,139,190)"
                }]
            },
            options: {
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    xAxes: [{
                        type: "time",
                        display: true,
                        time: {
                            stepSize: 5,
                            unit: "day",
                            displayFormats: {
                                'millisecond': 'MMM DD',
                                'second': 'MMM DD',
                                'minute': 'MMM DD',
                                'hour': 'MMM DD',
                                'day': 'MMM DD',
                                'week': 'MMM DD',
                                'month': 'MMM DD',
                                'quarter': 'MMM DD',
                                'year': 'MMM DD',
                            }
                        }
                    }]
                },
                title: {
                    display: true,
                    text: 'SCHEDULER ENDED FOR THE LAST 5MIN'
                }
            }
        })
    }

    addList = () => {
        let html = $("#reporter" + this.parentName + "ContentList").html()
        this.reporterData["hits"]["hits"].forEach((report) => {
            html = html + `
                <li class="list-group-item p-0"
                    style="font-size: 12px; border-left: 1px solid #DADEDF; border-right: 1px solid #DADEDF; border-bottom: 1px solid #DADEDF">
                    <div class="card border-0">
                        <div class="card-body">
                            <div class="card-title mouseHover" data-bs-toggle="collapse" href="#report_` + report["_id"] + `"
                                aria-expanded="false" aria-controls="report_` + report["_id"] + `"
                                onclick="loadReport('` + report["_id"] + `', '` + report["_source"]["execution_id"] + `') ;">
                                <div class="row">
                                    <div class="col-3">` + report["_source"]["start_at"] + `</div>
                                    <div class="col-3">` + report["_source"]["execution_id"] + `</div>
                                    <div class="col-3">` + report["_source"]["name"] + `</div>
                                    <div class="col-3">` + report["_source"]["description"] + `</div>
                                </div>
                            </div>
                            <div id="report_` + report["_id"] + `" class="collapse">
                            </div>
                        </div>
                    </div>
                </li>
            `
        })
        $("#reporter" + this.parentName + "ContentList").html(html)
    }

    addReportContent = (objectName, reportId, executionId) => {
        if (objectName === 'scheduler') {
            reportSchedulerList.render('report_' + reportId, reportId, executionId)
        } else if (objectName === 'scenario') {
            reportScenarioList.render('report_' + reportId, reportId, executionId)
        } else if (objectName === 'script') {
            reportScriptList.render('report_' + reportId, reportId, executionId)
        }
    }

    addChartAndList = () => {
        this.addChart()
        this.addList()
    }

    addFrame = () => {
        $("#" + this.parentName + "Report").html(this.frame.replace(/ObjectName/g, this.parentName))
    }

    render = (objectName, reporterData) => {
        this.objectName = objectName
        this.reporterData = reporterData
        this.addFrame()
        this.addChartAndList()
    }
}

export default Reporting