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

import ReportForm from './form.js'
import Reporting from './reporting.js'

var reportForm = new ReportForm()
var reporting = new Reporting()
var objectName = undefined

const loadReport = (reportId, executionId) => {
    console.log(objectName, reportId, executionId)
    reporting.addReportContent(objectName, reportId, executionId)
}

const objectNameSelected = () => {

    if ($("#reportScheduler").hasClass('active')) {
        return "scheduler"
    } else if ($("#reportScenario").hasClass('active')) {
        return "scenario"
    } else if ($("#reportScript").hasClass('active')) {
        return "script"
    }
}

const runReportFilter = () => {
   objectName = objectNameSelected()
   reportForm.runReportFilter(objectName).then((reportData) => {
        reporting.render(objectName, reportForm.scroll)
    })
}

function main() {

    reportForm.render('reportForm')
    runReportFilter()
}


window.main = main
window.runReportFilter = runReportFilter
window.loadReport = loadReport