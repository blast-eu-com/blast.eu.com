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

import Scheduler from '../../../scheduler.js'
import ScenarioFilterAndSelect from '../scenario/filterAndSelect.js'

var scenarioFilterAndSelect = new ScenarioFilterAndSelect()

var SchedulerForm = class {

    constructor() {

        this.frame = `
            <div class="row mb-3">
                <div id="schedulerNameContainer" class="col-md-6"></div>
                <div id="schedulerDescriptionContainer" class="col-md-6"></div>
            </div>
            <div class="row mb-3">
                <div id="schedulerExecDayContainer" class="col-md-12 border-right"></div>
            </div>
            <div class="row mb-3">
                <div id="schedulerExecTimeContainer"class="col-md-4"></div>
                <div id="schedulerExecIntervalMinContainer" class="col-md-4"></div>
                <div id="schedulerExecIntervalSecContainer" class="col-md-4"></div>
            </div>
            <div class="row mb-3">
                <div id="schedulerExecParallelModeContainer" class="col-md-6"></div>
            </div>
            <div class="row mb-3">
                <label for="schedulerListScenariosContainer" class="form-label">Select the scheduler scenarios to run</label>
                <div id="schedulerListScenariosContainer" class="col-md-12"></di>
            </div>
        `
        this.inputSchedulerName = `
            <label for="schedulerName" class="form-label">Scheduler Name</label>
            <input class="form-control" type="text" id="schedulerName" name="schedulerName" />
            <div id="schedulerNameHelp" class="form-text">Give a name to this new scheduler.</div>
        `
        this.inputSchedulerDescription = `
            <label for="schedulerDescription" class="form-label">Scheduler Description</label>
            <input class="form-control" type="text" id="schedulerDescription" name="schedulerDescription" />
            <div id="schedulerDescriptionHelp" class="form-text">Describe the new scheduler in a few words.</div>
        `
        this.schedulerExecDay = `
            <div class="form-check form-check-inline">
                  <input class="form-check-input" type="checkbox" value="monday" id="monday" onclick="unsetDayAll();"/>
                  <label class="form-check-label" for="monday">Monday</label>
            </div>
            <div class="form-check form-check-inline">
                  <input class="form-check-input" type="checkbox" value="tuesday" id="tuesday" onclick="unsetDayAll();"/>
                  <label class="form-check-label" for="tuesday">Tuesday</label>
            </div>
            <div class="form-check form-check-inline">
                  <input class="form-check-input" type="checkbox" value="wednesday" id="wednesday" onclick="unsetDayAll();"/>
                  <label class="form-check-label" for="wednesday">Wednesday</label>
            </div>
            <div class="form-check form-check-inline">
                  <input class="form-check-input" type="checkbox" value="thursday" id="thursday" onclick="unsetDayAll();"/>
                  <label class="form-check-label" for="thursday">Thursday</label>
            </div>
            <div class="form-check form-check-inline">
                  <input class="form-check-input" type="checkbox" value="friday" id="friday" onclick="unsetDayAll();"/>
                  <label class="form-check-label" for="monday">Friday</label>
            </div>
            <div class="form-check form-check-inline">
                  <input class="form-check-input" type="checkbox" value="saturday" id="saturday" onclick="unsetDayAll();"/>
                  <label class="form-check-label" for="tuesday">Saturday</label>
            </div>
            <div class="form-check form-check-inline">
                  <input class="form-check-input" type="checkbox" value="sunday" id="sunday" onclick="unsetDayAll();"/>
                  <label class="form-check-label" for="wednesday">Sunday</label>
            </div>
            <div class="form-check form-check-inline">
                  <input class="form-check-input" type="checkbox" value="allDays" id="allDays" onclick="setDayAll();" checked/>
                  <label class="form-check-label" for="allDays">All</label>
            </div>
            <div id="schedulerDaysHelp" class="form-text">Check the days you want the scheduler run.</div>
        `
        this.inputSchedulerParallelMode = `
            <input id="schedulerParallelMode" name="schedulerParallelMode" type="checkbox" class="form-check-input" />
            <label for="schedulerParallelMode" class="form-check-label">Scheduler Parallel Mode.</label>
            <div id="schedulerParallelModeHelp" class="form-text">Check if you want the scheduler runs the scenario selected in parallel mode.</div>
        `
        this._fd = undefined
        this._pn = undefined
    }

    set formData(fd) { this._fd = fd }
    set parentName(pn) { this._pn = pn }

    get formData() { return this._fd }
    get parentName() { return this._pn }

    setFormData = () => {
        let monday = $("#monday").is(":checked") ? true : false
        let tuesday = $("#tuesday").is(":checked") ? true : false
        let wednesday = $("#wednesday").is(":checked") ? true : false
        let thursday = $("#thursday").is(":checked") ? true : false
        let friday = $("#friday").is(":checked") ? true : false
        let saturday = $("#saturday").is(":checked") ? true : false
        let sunday = $("#sunday").is(":checked") ? true : false
        let allDays = $("#allDays").is(":checked") ? true : false
        this.formData = {
            "name":  $("#schedulerName").val(),
            "description": $("#schedulerDescription").val(),
            "daily": {
                "monday": monday,
                "tuesday": tuesday,
                "wednesday": wednesday,
                "thursday": thursday,
                "friday": friday,
                "saturday": saturday,
                "sunday": sunday,
                "all": allDays
            },
            "time": $("#scheduleTime").val(),
            "interval": {
                "min": $("#schedulerExecIntervalMin").val(),
                "sec": $("#schedulerExecIntervalSec").val()
            },
            "scenario_ids": this.scenarioList(),
            "flag_parallel_mode": $("#schedulerParallelMode").is(":checked") ? true : false
        }
    }

    addFrame = () => {
        $("#" + this.parentName).html(this.frame)
    }

    addForm() {
        this.addFrame()
        $('#schedulerNameContainer').html(this.inputSchedulerName)
        $('#schedulerDescriptionContainer').html(this.inputSchedulerDescription)
        $('#schedulerExecDayContainer').html(this.schedulerExecDay)
        $('#schedulerExecParallelModeContainer').html(this.inputSchedulerParallelMode)
    }

    addFormSelectInterval(intervalType) {

        if (intervalType === "min") {
            let html = `
                <label for="schedulerExecIntervalMin" class="form-label">Scheduler run interval (min).</label>
                <input id="schedulerExecIntervalMin" name="schedulerExecIntervalMin" class="form-control"
                    onkeyup="updateSetByMin() ;" pattern="\d*" type="text" />
                <div id="schedulerExecIntervalMinHelp" class="form-text">Set a scheduler run interval in minutes.</div>
            `
            $("#schedulerExecIntervalMinContainer").html(html)
        } else if (intervalType === 'sec') {
            let html = `
                <label for="schedulerExecIntervalSec" class="form-label">Scheduler run interval (sec).</label>
                <input id="schedulerExecIntervalSec" name="schedulerExecIntervalSec" class="form-control"
                    onkeyup="updateSetBySec() ;" pattern="\d*" type="text" />
                <div id="schedulerExecIntervalSecHelp" class="form-text">Set a scheduler run interval in seconds.</div>
            `
            $("#schedulerExecIntervalSecContainer").html(html)
        }
    }

    addFormSelectTime() {
        $("#schedulerExecTimeContainer").html(`
            <div class="">
                <label for="scheduleTime" class="form-label">Scheduler run time.</div>
                <input class="form-control" type="time" id="scheduleTime" onkeyup="updateSetByTime(); "/>
                <label id="scheduleTimeHelp" class="form-text">Set a scheduler run time.</label>
            </div>
        `)
    }

    scenarioList() {
        let scenarioName = []
        $("input[name=scenario").each(function(data, tag) {
            if ( tag.checked ) { scenarioName.push(tag.value) }
        })
        return scenarioName
    }

    render = (parentName) => {
        this.parentName = parentName
        this.addForm()
        scenarioFilterAndSelect.render('schedulerListScenariosContainer')
        this.addFormSelectInterval('min')
        this.addFormSelectInterval('sec')
        this.addFormSelectTime()
    }

    saveScheduler = () => {
        this.setFormData()
        console.log(this)
        let scheduler = new Scheduler()
        scheduler.add(this.formData).then(function(R) {
            if ( Object.keys(R).includes("result") && R["result"] === 'created' ) {
                location.reload()
            }
        })
    }

    setDayAll() {
        $("#monday").prop("checked", false)
        $("#tuesday").prop("checked", false)
        $("#wednesday").prop("checked", false)
        $("#thursay").prop("checked", false)
        $("#friday").prop("checked", false)
        $("#saturday").prop("checked", false)
        $("#sunday").prop("checked", false)
    }

    unsetDayAll() {
        $("#allDays").prop("checked", false)
    }

    updateSetByMin = () => {
        this.addFormSelectInterval('sec')
        this.addFormSelectTime()
    }

    updateSetBySec = () => {
        this.addFormSelectInterval('min')
        this.addFormSelectTime()
    }

    updateSetByTime = () => {
        this.addFormSelectInterval('min')
        this.addFormSelectInterval('sec')
    }


}

export default SchedulerForm











