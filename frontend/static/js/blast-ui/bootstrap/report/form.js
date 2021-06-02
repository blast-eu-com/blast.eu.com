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

import Reporter from "../../../reporter.js"

var reporter = new Reporter()

const ReportForm = class {

    constructor() {

        this._fd = undefined
        this._datetimeStartAt = undefined
        this._datetimeEndAt = undefined
        this._datetimeIntervalSelected = true
        this._datetimeRangeSelected = false
        this._objectNameSelected = undefined
        this._scroll = undefined

        this.frame = `
            <div class="row">
                <div id="reportDatePickerContainer" class="col-3"></div>
                <div id="reportFilterContainer" class="col-2 mt-3"></div>
                <div id="reportSearchContainer" class="col-7 mt-3"></div>
            </div>
        `

        this.reportFilterContent = `
            <div class="form-label fs-6 text-secondary" for="reportFilter">Select a report property</div>
            <select id="fieldNameFilter" name="fieldNameFilter" class="form-select">
                <option value="execution_id">execution_id</option>
                <option value="scenario_id">scenario_id</option>
                <option value="scheduler_id">scheduler_id</option>
                <option value="script_id">script_id</option>
                <option value="status">status</option>
                <option value="name">name</option>
            </select>
        `

        this.reportSearchContent = `
            <div class="form-label fs-6 text-secondary" for="reportPropertyValue">A string to match report property value</div>
            <div class="input-group">
                <button class="btn blast-btn" type="button" onclick="runReportFilter() ;">Search</button>
                <input id="fieldValueFilter" name="fieldValueFilter" type="text" class="form-control" aria-label="Text input with segmented dropdown button">
            </div>
        `

        this.reportDatePickerContent = `

            <ul class="nav nav-tabs" id="timePickerTab" role="tabList">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="datetime-tab" data-bs-toggle="tab" data-bs-target="#datetimePicker">Datetime</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="interval-tab" data-bs-toggle="tab" data-bs-target="#intervalPicker">Interval</button>
                </li>
            </ul>

            <div class="tab-content" id="timePickerTabContent">
                <div class="tab-pane fade show active" id="datetimePicker" role="tabpanel" aria-labelledby="datetime-tab">
                    <div class="p-1">
                        <input type="text" class="form-control" name="datetime"/>
                        <script>
                        $(function() {
                            $('input[name="datetime"]').daterangepicker({
                                timePicker: true,
                                timePicker24Hour: true,
                                timePickerSeconds: true,
                                startDate: moment().startOf('hour'),
                                endDate: moment().startOf('hour').add(32, 'hour'),
                                locale: {
                                    format: 'M/DD hh:mm:ss A'
                                }
                            });
                        });
                        </script>
                    </div>
                </div>
                <div class="tab-pane fade" id="intervalPicker" role="tabpanel" aria-labelledby="interval-tab">
                    <div class="row p-1">
                        <div class="col-6">
                            <input id="intervalValue" name="intervalValue" class="form-control" value="15" type="number" />
                        </div>
                        <div class="col-6">
                            <select id="intervalUnit" name="intervalUnit" class="form-select">
                                <option>minutes</option>
                                <option>hours</option>
                                <option>days</option>
                                <option>weeks</option>
                                <option>months</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    set formData(fd) { this._fd = fd }
    set datetimeStartAt(at) { this._datetimeStartAt = at }
    set datetimeEndAt(at) { this._datetimeEndAt = at }
    set datetimeRangeSelected(selected) { this._datetimeRangeSelected = selected }
    set datetimeIntervalSelected(selected) { this._datetimeIntervalSelected = selected }
    set objectNameSelected(objName) { this._objectNameSelected = objName }
    set scroll(id) { this._scroll = id }

    get formData() { return this._fd }
    get datetimeStartAt() { return this._datetimeStartAt }
    get datetimeEndAt() { return this._datetimeEndAt }
    get datetimeRangeSelected() { return this._datetimeRangeSelected }
    get datetimeIntervalSelected() { return this._datetimeIntervalSelected }
    get objectNameSelected() { return this._objectNameSelected }
    get scroll() { return this._scroll }

    setFormData = () => {
        this.formData = {
            "time": {
                "interval": {
                    "value": $("input[name=intervalValue]").val(),
                    "unit": $("select#intervalUnit option:selected").val(),
                    "selected": this.datetimeIntervalSelected
                },
                "datetime": {
                    "start_at": this.datetimeStartAt,
                    "end_at": this.datetimeEndAt,
                    "selected": this.datetimeRangeSelected
                }
            },
            "object": {
                "name": this.objectNameSelected
            },
            "search": [
                {
                    "field": $("select#fieldNameFilter option:selected").val(),
                    "string": $("input#fieldValueFilter").val()
                }
            ]
        }
    }

    addForm = () => {
        $("#" + this.parentName).html(this.frame)
        $("#reportFilterContainer").html(this.reportFilterContent)
        $("#reportSearchContainer").html(this.reportSearchContent)
        $("#reportDatePickerContainer").html(this.reportDatePickerContent)
    }

    runFilterFromForm = () => {
        if ($("a#reportScheduler").hasClass('active')) {
            this.runReportFilter('scheduler')
        } else if ($("a#reportScenario").hasClass('active')) {
            this.runReportFilter('scenario')
        } else if ($("a#reportScript").hasClass('active')) {
            this.runReportFilter('script')
        }
    }

    runReportFilter = async (objectName) => {
        this.objectNameSelected = objectName
        this.setFormData()
        this.scroll = await reporter.filter_scroll(this.formData)
    }

    render = (parentName) => {
        this.parentName = parentName
        this.addForm()

        /*
         * Add Event Listener on form objects
         */
        $("select#intervalUnit").on('change', () => {
            this.datetimeRangeSelected = false
            this.datetimeIntervalSelected = true
        })

        $("input#intervalValue").on('change', () => {
            this.datetimeRangeSelected = false
            this.datetimeIntervalSelected = true
        })

        $("input[name=datetime]").on('apply.daterangepicker', (ev, picker) => {
            this.datetimeStartAt = picker.startDate._d.toISOString()
            this.datetimeEndAt = picker.endDate._d.toISOString()
            this.datetimeRangeSelected = true
            this.datetimeIntervalSelected = false
        })
    }

}

export default ReportForm