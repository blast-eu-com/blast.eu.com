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

import Scheduler from './scheduler.js'
let sched = new Scheduler()

const setPageTitle = function(schedulerName) {
    $('#navSchedulerName').html(schedulerName)
}

const setButtonDeleteAction = function(scheduler_id) {
    $('#btnDelScheduler').on("click", async function() {
        let schedulerDeleteResp = await scheduler.delete(scheduler_id)
        if ( schedulerDeleteResp["result"] === "deleted" ) { location.href = "/html/scheduler.html" }
    })
}

const setSchedulerDetailsTable = function(schedulerDetails) {
    let html = `<img style="margin-left: 1rem" src="/img/object/schedule.svg" width="56" height="56" />
    <table class="table mt-2"><thead></thead><tr><td><b>Scheduler id</b></td><td>` + schedulerDetails["_id"] + `</td></tr>`
    $.each(schedulerDetails["_source"], function(idx, val) {
        html = html + '<tr><td><b>' + idx.charAt(0).toUpperCase() + idx.slice(1) + '</b></td><td>' + val + '</td></tr>'
    })
    return html + '</table>'
}

const loadSchedulerDetails = async function() {
    let urlParams = new URLSearchParams(window.location.href.split('?')[1])
    if ( urlParams.has("scheduler_id") ) {
        sched.id = urlParams.get("scheduler_id")
        sched.name = urlParams.get("scheduler_name")

        setPageTitle(sched.name)
        setButtonDeleteAction(sched.id)

        let schedulerDetails = await sched.listById(sched.id)
        console.log(schedulerDetails)
        if ( schedulerDetails["hits"]["total"]["value"] === 1 ) {
            $("#schedulerDetails").html(setSchedulerDetailsTable(schedulerDetails["hits"]["hits"][0]))
        }
    }
}





window.loadSchedulerDetails = loadSchedulerDetails