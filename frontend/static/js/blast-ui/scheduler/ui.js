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
import SchedulerSelectAndManage from './selectAndManage.js'
import SchedulerForm from './form.js'
import SchedulerOnGoing from './ongoing.js'
import SchedulerLast from './last.js'
import ScenarioFilterAndSelect from '../scenario/filterAndSelect.js'
var scheduler = new Scheduler()
var scenarioFilterAndSelect = new ScenarioFilterAndSelect()
var schedulerSelectAndManage = new SchedulerSelectAndManage('schedulerRun')
var schedulerForm = new SchedulerForm('schedulerExecContainer')
var schedulerOnGoing = new SchedulerOnGoing('schedulerOnGoing')
var schedulerLast = new SchedulerLast('schedulerLast')
var refresher

const refresh = (refreshInterval) => {
    refresher = setInterval(() => {
        schedulerLast.refresh()
        schedulerOnGoing.refresh()
    }, refreshInterval)
}

const unrefresh = () => {
    clearInterval(refresher)
}

const intervalSchedulerReportRefresh = () => {
    let refreshInterval = parseInt($('select[name=intervalSchedulerReportRefresh] option:selected').val() * 1000)
    if ($("#switchSchedulerReportRefresh").is(":checked")) {
        unrefresh()
        refresh(refreshInterval)
    }
}

const switchSchedulerReportRefresh = () => {
    let refreshInterval = parseInt($('select[name=intervalSchedulerReportRefresh] option:selected').val() * 1000)
    if ($("#switchSchedulerReportRefresh").is(":checked")) { refresh(refreshInterval) } else { unrefresh() }
}

const main = function() {
    schedulerForm.render()
    let scenarioPageLength = $("select#scenarioSelSamplePerPage option:selected").val()
    let schedulerPageLength = $("select#schedulerSelSamplePerPage option:selected").val()
    schedulerSelectAndManage.render()
    schedulerOnGoing.render()
    schedulerLast.render()
}



window.main = main
window.searchScenarioByName = scenarioFilterAndSelect.loadScenarioByName
window.startScheduler = schedulerSelectAndManage.startSchedule
window.stopScheduler = schedulerSelectAndManage.stopSchedule
window.restartScheduler = schedulerSelectAndManage.restartSchedule
window.schedulerRunDisplayNewRange = schedulerSelectAndManage.schedulerRunWindowCoreData
window.schedulerRunSearchString = schedulerSelectAndManage.loadSchedulerByName
window.updateSetByMin = schedulerForm.updateSetByMin
window.updateSetBySec = schedulerForm.updateSetBySec
window.updateSetByTime = schedulerForm.updateSetByTime
window.unsetDayAll = schedulerForm.unsetDayAll
window.setDayAll = schedulerForm.setDayAll
window.saveScheduler = schedulerForm.saveScheduler
window.switchSchedulerReportRefresh = switchSchedulerReportRefresh
window.intervalSchedulerReportRefresh = intervalSchedulerReportRefresh