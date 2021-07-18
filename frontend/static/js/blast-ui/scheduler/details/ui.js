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

import Scheduler from '../../../scheduler.js'
import SchedulerListInfo from './listInfo.js'

var scheduler = new Scheduler
var schedulerListInfo = new SchedulerListInfo

const setPageTitle = function(schedulerName) {
    $('#navSchedulerName').html(schedulerName)
}

const setButtonDeleteAction = function(scheduler) {
    $('#btnDelScheduler').on("click", async function() {
        let schedulerDeleteResp = await scheduler.delete(scheduler.id)
        if ( schedulerDeleteResp["result"] === "deleted" ) { location.href = "/html/scheduler.html" }
    })
}

async function main() {

    let urlParams = new URLSearchParams(window.location.href.split('?')[1])
    if ( urlParams.has("id") ) {
        let scheduler_id = urlParams.get("id")
        let scheduler_data = await scheduler.listByIds([scheduler_id])
        scheduler.load(scheduler_data["hits"]["hits"][0])
        setPageTitle(scheduler.name)
        setButtonDeleteAction(scheduler)
        schedulerListInfo.render('schedulerListInfo', scheduler)
    }


}

window.main = main