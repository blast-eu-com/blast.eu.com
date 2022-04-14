/*
 *   Copyright 2022 Jerome DE LUCCHI
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

import Scheduler from '../../scheduler.js'
import ScenarioFilterAndSelect from '../scenario/filterAndSelect.js'
import Toast from '../main/notification/toast.js'
import {dictionary} from '../main/message/en/dictionary.js'
var toast = new Toast()
var scheduler = new Scheduler()
var scenarioFilterAndSelect = new ScenarioFilterAndSelect('schedulerListScenariosContainer')
toast.msgPicture = '../../../img/object/scheduler.svg'

var SchedulerForm = class {

    constructor(parentName) {
        this.parentName = parentName
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

    get formData() { return this._fd }

    setFormData = () => {
        this.formData = {}
        this.formData["name"] = $("#schedulerName").val()
        this.formData["description"] = $("#schedulerDescription").val()
        this.formData["frequency"] = {}
        this.formData["frequency"]["daily"] = {}
        this.formData["frequency"]["daily"]["monday"] = $("#monday").is(":checked") ? true : false
        this.formData["frequency"]["daily"]["tuesday"] = $("#tuesday").is(":checked") ? true : false
        this.formData["frequency"]["daily"]["wednesday"] = $("#wednesday").is(":checked") ? true : false
        this.formData["frequency"]["daily"]["thursday"] = $("#thursday").is(":checked") ? true : false
        this.formData["frequency"]["daily"]["friday"] = $("#friday").is(":checked") ? true : false
        this.formData["frequency"]["daily"]["saturday"] = $("#saturday").is(":checked") ? true : false
        this.formData["frequency"]["daily"]["sunday"] = $("#sunday").is(":checked") ? true : false
        this.formData["frequency"]["daily"]["all"] = $("#allDays").is(":checked") ? true : false
        this.formData["frequency"]["interval"] = {}
        this.formData["frequency"]["interval"]["min"] = $("#schedulerExecIntervalMin").val() !== "" ? $("#schedulerExecIntervalMin").val() : "0"
        this.formData["frequency"]["interval"]["sec"] = $("#schedulerExecIntervalSec").val() !== "" ? $("#schedulerExecIntervalSec").val() : "0"
        this.formData["frequency"]["time"] = $("#scheduleTime").val() !== "" ? $("#scheduleTime").val() : "1970-01-01T00:00:00Z"
        this.formData["scenario_ids"] = this.scenarioList()
        this.formData["flag_parallel_mode"] = $("#schedulerParallelMode").is(":checked") ? true : false
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

    render = () => {
        this.addForm()
        scenarioFilterAndSelect.render()
        this.addFormSelectInterval('min')
        this.addFormSelectInterval('sec')
        this.addFormSelectTime()
    }

    saveScheduler = () => {
        this.setFormData()
        let actionRes, schedulerData = this.formData
        scheduler.add(schedulerData).then((Resp) => {
            if (Resp["result"] === "created") {
                toast.msgTitle = "Scheduler create Success"
                toast.msgText = dictionary["scheduler"]["add"].replace('%schedulerName%', schedulerData["name"])
                actionRes = "success"
            } else if ( Object.keys(Resp).includes("failure") ) {
                toast.msgTitle = "Scheduler create Failure"
                toast.msgText = Resp["failure"]
                actionRes = "failure"
            }
            toast.notify(actionRes)
            setTimeout(() => { location.reload() }, 2000)
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











