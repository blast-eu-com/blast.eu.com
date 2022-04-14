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
import Scheduler from '../../scheduler.js'

var scheduler = new Scheduler()
var SchedulerSelectAndManage = class {

    constructor(parentName) {
        this.parentName = parentName
        this.frame = `
             <div class="input-group">
                <div class="input-group-text">
                    <img src="/img/bootstrap-icons-1.0.0-alpha5/search.svg" />
                </div>
                <input class="form-control form-control-sm" id="schedulerNameSearch" type="text" placeholder="Search a scheduled management scenario" />
                <button class="btn blast-btn btn-sm" onclick="schedulerRunSearchString();">Search</button>
            </div>
            <div id="schedulerRunWindowFrameCore" class="mt-2"></div>
            <div id="schedulerRunWindowInteractive" class="row p-1 m-1"></div>
        `
    }

    addFrame = () => {
        $("#" + this.parentName).html(this.frame)
    }

    schedulerStringSearch() {
        return $("input#schedulerNameSearch").val()
    }

    templateScheduler = (schedulerData) => {
        let html = `<table class="table table-sm" style="font-size: small;">
        <thead><tr><th></th><th>Name</th><th>Description</th><th>State</th><th>Action</th></tr></thead>`
        schedulerData.forEach((sched) => {
            html = html + `
                <tr>
                    <td><img src="/img/object/schedule.svg" height="24" width="24"/></td>
                    <td><a href="/html/scheduler-details.html?id=` + sched["_id"] + `">` + sched["_source"]["name"] + `</a></td>
                    <td>` + sched["_source"]["description"] + `</td>
                    <td>` + sched["_source"]["status"] + `</td>
                    <td>
                        <img src="/img/bootstrap-icons-1.0.0-alpha5/three-dots.svg" class="dropdown-toggle" id="` + sched["_id"] + `" data-bs-toggle="dropdown" aria-expanded="false" />
                        <ul class="dropdown-menu" aria-labelledby="` + sched["_id"] + `">
                            <li><button class="dropdown-item" type="button" onclick="switchMemberRole() ;">Restart</button></li>
                            <li><button class="dropdown-item" type="button" onclick="switchMemberRole() ;">Start</button></li>
                            <li><button class="dropdown-item" type="button" onclick="switchMemberRole() ;">Stop</button></li>
                        </ul>
                    </td>
                </tr>
            `
        })
        return html
    }

    loadScheduler = () => {
        scheduler.list().then((schedulerData) => {
            $("#schedulerRunWindowInteractive").pagination({
                dataSource: schedulerData["hits"]["hits"],
                pageSize: 60,
                callback: (data, pagination) => {
                    let html = this.templateScheduler(data)
                    $("#schedulerRunWindowFrameCore").html(html)
                }
            })
        })
    }

    loadSchedulerByName = () => {
        let schedulerName = this.schedulerStringSearch()
        scheduler.searchByName(schedulerName).then((schedulerData) => {
            $("#schedulerRunWindowInteractive").pagination({
                dataSource: schedulerData["hits"]["hits"],
                pageSize: 60,
                callback: (data, pagination) => {
                    let html = this.templateScheduler(data)
                    $("#schedulerRunWindowFrameCore").html(html)
                }
            })
        })
    }

    scheduleChecked() {
        let schedulers = []
        $("input[name='scheduler']").each(function(data, tag) {
            if ( tag.checked ) { schedulers.push(tag.value) }
        })
        return schedulers
    }

    startSchedule = () => {
        let data = { "schedule": this.scheduleChecked(), "action": "start" }
            scheduler.action(data).then((R) => {
            this.schedulerRunWindowCoreData()
        })
    }

    stopSchedule = () => {
        let data = { "schedule": this.scheduleChecked(), "action": "stop" }
            scheduler.action(data).then((R) => {
            this.schedulerRunWindowCoreData()
        })
    }

    restartSchedule = () => {
        let data = { "schedule" : this.scheduleChecked(), "action": "restart" }
        scheduler.action(data).then((R) => {console.log(R)})
    }

    // return the render of the scheduler select and Manage window
    render = () => {
        this.addFrame()
        this.loadScheduler()
    }

}

export default SchedulerSelectAndManage