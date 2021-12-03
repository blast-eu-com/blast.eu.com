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

const SchedulerListInfo = class {

    addListInfo = (scheduler) => {
        console.log(scheduler)
        let html = `
            <img style="margin-left: 1rem" src="/img/object/schedule.svg" width="56" height="56" />
            <table class="table mt-2"><thead></thead>
            <tr><td><b>Scheduler id</b></td><td>` + scheduler["_id"] + `</td></tr>
        `
        $.each(scheduler.rawData, (idx, val) => {
            if ( idx === 'frequency' ) {
                $.each(val, (subIdx, subVal) => {
                    if ( subIdx === 'daily') {
                        html = html  + '<tr><td><b>' + subIdx.charAt(0).toUpperCase() + subIdx.slice(1) + '</b></td><td><table>'
                        $.each(subVal, (dailyIdx, dailyVal) => {
                            html = html + '<tr><td><b>' + dailyIdx.charAt(0).toUpperCase() + dailyIdx.slice(1) + '</b></td><td class="ps-5">' + dailyVal + '</td></tr>'
                        })
                        html = html + '</table></td></tr>'
                    } else if (subIdx === 'interval') {
                        html = html  + '<tr><td><b>' + subIdx.charAt(0).toUpperCase() + subIdx.slice(1) + '</b></td><td><table>'
                        $.each(subVal, (intervIdx, intervVal) => {
                            html = html + '<tr><td><b>' + intervIdx.charAt(0).toUpperCase() + intervIdx.slice(1) + '</b></td><td class="ps-5">' + intervVal + '</td></tr>'
                        })
                        html = html + '</table></td></tr>'
                    }
                })
            } else if ( idx === 'scenario_ids' ) {
                let html_scenario_ids = ''
                val.forEach((scenario_id) => { html_scenario_ids = html_scenario_ids + '<a class="me-1" href="/html/scenario-details.html?id=' + scenario_id + '"><span class="badge blast-badge">' + scenario_id + '</span></a>' })
                html = html + '<tr><td><b>' + idx.charAt(0).toUpperCase() + idx.slice(1) + '</b></td><td>' + html_scenario_ids + '</td></tr>'
            } else {
                html = html + '<tr><td><b>' + idx.charAt(0).toUpperCase() + idx.slice(1) + '</b></td><td>' + val + '</td></tr>'
            }
        })
        $("#" + this.parentName).html(html + '</table>')
    }

    render = (parentName, scheduler) => {
        this.parentName = parentName
        this.addListInfo(scheduler)
    }

}

export default SchedulerListInfo