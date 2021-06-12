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

import { listAgg } from '../../../../../reporter.js'

const ReportScenarioChart = class {

    constructor() {
        this._pn = undefined
        this._reportData = undefined
        this._frame = `<canvas class="mb-3" id="reportScenarioCanvas" width="400" height="100"></canvas>`
        this._chart
    }

    set parentName(pn) { this._pn = pn }
    set reportData(rd) { this._reportData = rd }
    set chart(ch) { this._chart = ch }

    get parentName() { return this._pn }
    get reportData() { return this._reportData }
    get chart() { this._chart }

    addChart = () => {
        let ctx = $("#reportScenarioCanvas")
        let data = []

        this.reportData["aggregations"]["time"]["buckets"].forEach((bucket) => {
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
                }
            }
        })
    }

    addFrame = () => {
        $("#" + this.parentName).html(this._frame)
    }

    render = (parentName, formData) => {
        this.parentName = parentName
        this.addFrame()
        listAgg(formData).then((reportData) => {
            this.reportData = reportData
            this.addChart()
        })
    }

}


export default ReportScenarioChart