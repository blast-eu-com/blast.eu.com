/*
 *   Copyright 2020 Jerome DE LUCCHI
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


const SchedulerLast = class {

    constructor() { }

    addChart = (reports) => {
        console.log(reports)
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
                    backgroundColor: "rgb(75,139,190)"
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
                    <td>` + report["_source"]["scheduler_name"] + `</td>
                    <td>` + report["_source"]["status"] + `</td>
                    <td>` + report["_source"]["start_at"] + `</td>
                    <td>` + report["_source"]["end_at"] + `</td>
                    <td>` + report["_source"]["duration"]["time"] + `</td>
                </tr>
            `
        })

        $("#" + this.parentName).html(html + '</table>')
    }

    addChartAndLast = async () => {
        let start_at = new Date(new Date().getTime() - 5*60000).toISOString()
        let end_at = new Date(new Date().getTime()).toISOString()
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
        let res_query_scroll = await this.reporter.filter_scroll(reportData)
        this.addChart(res_query_scroll)
        this.addLast(res_query_scroll)
    }

    switchSchedulerReportLastRefresh = () => {
        this.refreshInterval = parseInt($('select[name=intervalSchedulerReportLastRefresh] option:selected').val() * 1000)
        console.log(this.refreshInterval)
        if ($("#switchSchedulerReportLastRefresh").is(":checked")) {
            this.refresh()
        } else {
            this.unrefresh()
        }
    }

    intervalSchedulerReportLastRefresh = () => {
        this.refreshInterval = parseInt($('select[name=intervalSchedulerReportLastRefresh] option:selected').val() * 1000)
        console.log(this.refreshInterval)
        if ($("#switchSchedulerReportLastRefresh").is(":checked")) {
            // this.unrefresh()
            clearTimeout(this.run)
            this.refresh()
        }
    }

    refresh = () => {
        setTimeout(() => {
            this.chart.destroy()
            this.addChartAndLast()
            console.log(new Date(new Date().getTime()))
        }, this.refreshInterval)
        this.run = setTimeout(this.refresh, this.refreshInterval)
    }

    unrefresh = () => {
        clearTimeout(this.run)
    }

    render = (parentName, reporter) => {
        this.parentName = parentName
        this.reporter = reporter
        this.addChartAndLast()
    }
}

export default SchedulerLast