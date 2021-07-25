/*
   Copyright 2021 Jerome DE LUCCHI


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

import { filterScroll } from '../../reporter.js'

const ScenarioLast = class {

    constructor(parentName) {
        this.parentName = parentName
    }

    addLast = async () => {
        let start_at = new Date(new Date().getTime() - 60*60000).toISOString()
        let end_at = new Date(new Date().getTime()).toISOString()
        let query_data = {
            "time": {
                "interval": {
                    "value": "60",
                    "unit": "minutes",
                    "selected": true
                },
                "datetime": {
                    "selected": false
                }
            },
            "object": {
                "name": "scenario"
            },
            "search": [
                {
                    "field": "scenario_id",
                    "string": "oneshot-*"
                }
            ]
        }
        let res_query_data = await filterScroll(query_data)
        let html = `
            <table class="table table-sm">
                <thead>
                    <th>Execution Id</th>
                    <th>Scenario Id</th>
                    <th>Start At</th>
                    <th>End At</th>
                    <th>Status</th>
                    <th>Elapsed</th>
                </thead>
        `

        res_query_data["hits"]["hits"].forEach((report) => {

            var elapsedTime = ''
            var end_at = ''
            html = html + `<tr>
                    <td>` + report["_source"]["execution_id"] + `</td>
                    <td>` + report["_source"]["scenario_id"] + `</td>
                    <td>` + report["_source"]["start_at"] + `</td>`

            if ( report["_source"]["status"] !== "Ended" ) {
                let current = new Date().getTime()
                let start_at = new Date(report["_source"]["start_at"]).getTime()
                let elapsedTime = (current - (start_at - new Date().getTimezoneOffset() * 60000)) / 1000

                html = html + `<td> - </td>
                    <td>` + report["_source"]["status"] + `</td>
                    <td>` + elapsedTime + `</td></tr>`

            } else {
                let end_at = new Date(report["_source"]["end_at"]).getTime()
                let start_at = new Date(report["_source"]["start_at"]).getTime()
                let elapsedTime = (end_at - start_at) / 1000
                end_at = report["_source"]["end_at"]

                html = html + `<td>` + end_at + `</td>
                    <td>` + report["_source"]["status"] + `</td>
                    <td>` + elapsedTime + `</td></tr>`

            }
        })
        $("#" + this.parentName).html(html + `</table>`)
    }

    switchScenarioReportLast = () => {
        if($("#switchScenarioReportLast").is(":checked")) {
            this.refresh()
        } else {
            this.unrefresh()
        }
    }

    refresh = () => {
        this.recur = setInterval(() => {
            this.addLast()
        }, 5000)
    }

    unrefresh = () => {
        clearInterval(this.recur)
    }

    render = () => {
        this.addLast()
    }

}

export default ScenarioLast