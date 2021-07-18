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

import ReportScriptList from './list.js'
import ReportScriptChart from './chart.js'

var reportScriptList = new ReportScriptList()
var reportScriptChart = new ReportScriptChart()

export function main(formData) {
    reportScriptChart.render('reportScriptChart', formData)
    reportScriptList.render('reportScriptList', formData)
}