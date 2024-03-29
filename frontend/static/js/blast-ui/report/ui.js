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

import ReportForm from './form.js'
import { main as reportSchedulerUI } from './details/scheduler/ui.js'
import { main as reportScenarioUI } from './details/scenario/ui.js'
import { main as reportScriptUI } from './details/script/ui.js'

var reportForm = new ReportForm()

const runReportFilter = () => {
    if ($("#reportScheduler").hasClass('active')) {
        reportForm.objectNameSelected = 'scheduler'
        reportForm.setFormData()
        reportSchedulerUI(reportForm.formData)
    } else if ($("#reportScenario").hasClass('active')) {
        reportForm.objectNameSelected = 'scenario'
        reportForm.setFormData()
        reportScenarioUI(reportForm.formData)
    } else if ($("#reportScript").hasClass('active')) {
        reportForm.objectNameSelected = 'script'
        reportForm.setFormData()
        reportScriptUI(reportForm.formData)
    }
}

function main() {
    reportForm.render('reportForm')
    runReportFilter()
}


window.main = main
window.runFormFilter = runReportFilter
window.loadReportScheduler = runReportFilter
window.loadReportScenario = runReportFilter
window.loadReportScript = runReportFilter