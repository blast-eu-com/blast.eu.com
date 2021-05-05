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


const SchedulerOnGoing = class {

    constructor() { }

    addOnGoing = async () => {

        let report_data = {
            "time": {
                "interval": {
                    "value": "7",
                    "unit": "days",
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
                    "field": "status",
                    "string": "Running"
                }
            ]
        }
        let res_query_scroll = await this.reporter.filter_scroll(report_data)

        let html = `<table class="table">
        <thead>
        <th>Execution Id</th>
        <th>Scheduler Name</th>
        <th>Start Time</th>
        <th>Progress Bar</th>
        </thead>`
        res_query_scroll["hits"]["hits"].forEach((report) => {
            let current_at = new Date().getTime() / 1000
            let delta = current_at - report["_source"]["duration"]["start_at"]
            let percent = parseInt((delta / report["_source"]["duration"]["avg"])*100)
            console.log(current_at, report["_source"]["duration"]["start_at"], delta, report["_source"]["duration"]["avg"], percent)
            html = html + `
            <tr>
            <td>` + report["_source"]["execution_id"] + `</td>
            <td>` + report["_source"]["scheduler_name"] + `</td>
            <td>` + report["_source"]["start_at"] + `</td>
            <td>
            <div class="progress mb-3">
                <div class="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar" aria-valuenow="` + percent +`" aria-valuemin="0" aria-valuemax="100"
                style="width: ` + percent + `%">` + percent + `%</div>
            </div>
            </td></tr>
            `
        })
        $("#" + this.parentName).html(html + '</table>')
    }

    switchSchedulerReportRunRefresh = () => {
        if ($("#switchSchedulerReportRunRefresh").is(":checked")) {
            let refreshInterval = parseInt($('select[name=intervalSchedulerReportRunRefresh] option:selected').val() * 1000)
            console.log(refreshInterval)
            this.refresh(refreshInterval)
        } else {
            this.unrefresh()
        }
    }

    intervalSchedulerReportRunRefresh = () => {
        if ($("#switchSchedulerReportRunRefresh").is(":checked")) {
            this.unrefresh()
            let refreshInterval = parseInt($('select[name=intervalSchedulerReportRunRefresh] option:selected').val() * 1000)
            console.log(refreshInterval)
            this.refresh(refreshInterval)
        }
    }

    refresh = (interval) => {
        this.recur = setInterval(() => {
            this.addOnGoing()
        }, interval)
    }

    unrefresh = () => {
        clearInterval(this.recur)
    }

    render = (parentName, reporter) => {
        this.parentName = parentName
        this.reporter = reporter
        this.addOnGoing()
    }
}

export default SchedulerOnGoing