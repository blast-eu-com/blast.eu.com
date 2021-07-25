/*
 *   Copyright 2021 Jerome DE LUCCHI
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
*/

import { filterScroll } from '../../reporter.js'
import SchedulerOnGoing from './ongoing.js'

var schedulerOnGoing = new SchedulerOnGoing()

const SchedulerLast = class {

    constructor() { }

    addChart = (reports) => {
        let ctx = $("#schedulerLastChart")
        let data = []

        reports["aggregations"]["time"]["buckets"].forEach((bucket) => {
            data.push({"x": bucket["key_as_string"], "y": bucket["doc_count"]})
        })

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                datasets: [{
                    data: data,
                    backgroundColor: "rgb(9,149,211)"
                }]
            },
            options: {
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { display: false }
                },
                title: {
                    display: true,
                    text: 'SCHEDULER ENDED FOR THE LAST 5MIN'
                }
            }
        })
    }

    addLast = (reports) => {

        let html = `
            <table class="table" style="font-size: 12px;">
            <thead>
                <th>Execution Id</th>
                <th>Scheduler Name</th>
                <th>Status</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Duration Time</th>
            </thead>
        `

        reports["hits"]["hits"].forEach((report) => {
            html = html + `
                <tr>
                    <td>` + report["_source"]["execution_id"] + `</td>
                    <td>` + report["_source"]["name"] + `</td>
                    <td>` + report["_source"]["status"] + `</td>
                    <td>` + report["_source"]["start_at"] + `</td>
                    <td>` + report["_source"]["end_at"] + `</td>
                    <td>` + report["_source"]["duration"]["time"] + `</td>
                </tr>
            `
        })

        $("#" + this.parentName).html(html + '</table>')
    }

    addChartAndLast = () => {
        let reportData = {
            "time": {
                "interval": {
                    "value": "5",
                    "unit": "minutes",
                    "selected": true
                },
                "datetime": {
                    "selected": false
                }
            },
            "object": {
                "name": "scheduler"
            },
            "search": [
                {
                    "field": "",
                    "string": ""
                }
            ]
        }
        filterScroll(reportData).then((res_query_scroll) => {
            this.addChart(res_query_scroll)
            this.addLast(res_query_scroll)
        })
    }

    refresh = () => {
        this.chart.destroy()
        this.addChartAndLast()
    }

    render = (parentName) => {
        this.parentName = parentName
        this.addChartAndLast()
    }
}

export default SchedulerLast