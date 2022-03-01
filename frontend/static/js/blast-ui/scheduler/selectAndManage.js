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

    constructor() {
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
        this.nr = 10                // number of record per page
        this.cn = 0                 // current number of record
        this.lp = 1                 // last page
        this.fp = 1                 // first page
        this.cp = 1                 // current page
    }

    set numRecord(nr) { this.nr = nr }
    set curNumRecord(cn) { this.cn = cn }
    set lastPage(lp) { this.lp = lp }
    set firstPage(fp) { this.fp = fp }
    set curPageNum(cp) { this.cp = cp }

    get numRecord() { return this.nr }
    get curNumRecord() { return this.cn }
    get lastPage() { return this.lp }
    get firstPage() { return this.fp }
    get curPageNum() { return this.cp }

    addFrame = (parentName) => {
        $("#" + parentName).html(this.frame)
    }

    schedulerStringSearch() {
        return $("input#schedulerNameSearch").val()
    }

    schedulerPageLength() {
        return $("select#schedulerSelSamplePerPage option:selected").val()
    }

    filterStrMatch(str, ref) {
        if ( str !== '') {
            let regexp = new RegExp('.*' + str + '.*')
            var bool = (regexp.test(ref)) ? true : false }
        else { var bool = true }
        return bool
    }

    filterSchedulerData = (schedulerData, filterStr) => {
        let schedulerDataFiltered = []
        for (let i=0; i<schedulerData.length; i++) {
            let record = schedulerData[i]
            if (this.filterStrMatch(filterStr, record["_source"]["name"])) {
                schedulerDataFiltered.push(record)
            }
        }
        this.curNumRecord = schedulerDataFiltered.length
        return schedulerDataFiltered
    }

    schedulerRunCoreRow = (record) => {
        let html = `
            <li>
                <div class="selectAndManageRow">
                    <div class="selectAndManageField selectAndManageFieldImg"><img src="/img/object/schedule.svg" height="24" width="24"/></div>
                    <div class="selectAndManageField selectAndManageFieldName"><a href="/html/scheduler-details.html?id=` + record["_id"] + `">` + record["_source"]["name"] + `</a></div>
                    <div class="selectAndManageField selectAndManageFieldDescription">` + record["_source"]["description"] + `</div>
                    <div class="selectAndManageField selectAndManageFieldState">` + record["_source"]["status"] + `</div>
                    <div class="selectAndManageField selectAndManageFieldControl">
                        <img src="/img/bootstrap-icons-1.0.0-alpha5/three-dots.svg" class="dropdown-toggle" id="` + record["_id"] + `" data-bs-toggle="dropdown" aria-expanded="false" />
                        <ul class="dropdown-menu" aria-labelledby="` + record["_id"] + `">
                            <li><button class="dropdown-item" type="button" onclick="switchMemberRole() ;">Restart</button></li>
                            <li><button class="dropdown-item" type="button" onclick="switchMemberRole() ;">Start</button></li>
                            <li><button class="dropdown-item" type="button" onclick="switchMemberRole() ;">Stop</button></li>
                        </ul>
                    </div>
                </div>
            </li>`
        return html
    }

    schedulerRunCoreData = (schedulerData) => {
        let filterStr = this.schedulerStringSearch()
        let schedulerDataFiltered = this.filterSchedulerData(schedulerData, filterStr)
        let firstRec = ( this.curPageNum - 1 ) * this.numRecord
        let lastRec = ( this.curPageNum * this.numRecord )
        let html = '<table class="table table-sm"><tr>'
        if (schedulerDataFiltered.length < lastRec ) { lastRec = schedulerDataFiltered.length }
        for (let i=firstRec; i<lastRec; i++) { html = html + this.schedulerRunCoreRow(schedulerDataFiltered[i]) }
        $("#schedulerRunWindowFrameCore").html(html)
        return true
    }

    schedulerRunWindowInteractive() {
        let html = `
            <div id="schedulerListPerPage" class="col-2 mt-2">
                <select class="form-select" id="schedulerSelSamplePerPage" onchange="schedulerRunDisplayNewRange()">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                </select>
            </div>
            <div class="col-10 mt-2">
                <nav><ul id="schedulerRunWindowFramePagination" class="pagination"></ul></nav>
            </div>
        `
        $("#schedulerRunWindowInteractive").html(html)
    }

    schedulerRunWindowPagination = () => {
        this.curNumRecord > 1 ? this.firstPage = 1 : this.firstPage = 0
        this.curNumRecord > 1 ? this.lastPage = Math.ceil(this.curNumRecord/this.numRecord) : this.lastPage = 0
        let html = ''
        if (this.curNumRecord > 0 ) {
            this.schedulerRunWindowInteractive()
            if (this.curNumRecord > this.numRecord) {
                if ( this.lastPage > this.firstPage ) {
                    let html = `<li class="page-item" onclick="schedulerRunGoToPrevPage();">
                        <a class="page-link blast-page-link" href="#">Previous</a></li>`
                    for ( let i = this.firstPage; i<this.lastPage; i++) {
                        html = html + `<li class="page-item">
                            <a class="page-link blast-page-link" onclick="schedulerRunGoToThisPage(` + i + `);">` + i + `</a></li>`
                    }
                    html = html + `<li class="page-item" onclick="schedulerRunGoToNextPage();">
                        <a class="page-link blast-page-link" href="#">Next</a></li>`
                }
            }
        }
        $("#schedulerRunWindowFramePagination").html(html)
        return true
    }

    schedulerRunGoToNextPage = (curPageNum, lastPage) => {
        let nextPage = curPageNum + 1
        if ( nextPage <= lastPage ) {
            this.curPageNum = nextPage
            scheduler.list().then((scenarios) => {
                if (scenarios["hits"]["total"]["value"] > 0) {
                    this.schedulerRunCoreData(scenarios["hits"]["hits"])
                    this.schedulerRunWindowPagination()
                }
            })
        }
    }

    // navigate thru data
    // go to the previous page of the current
    schedulerRunGoToPrevPage = (curPageNum) => {
        let prevPage = curPageNum - 1
        if ( prevPage > 0 ) {
            this.curPageNum = prevPage
            scheduler.list().then((schedulers) => {
                if (schedulers["hits"]["total"]["value"] > 0) {
                    this.schedulerRunCoreData(schedulers["hits"]["hits"])
                    this.schedulerRunWindowPagination()
                }
            })
        }
    }

    // navigate thru data
    // go to the specified page
    schedulerRunGoToThisPage = (pageNum) => {
        this.curPageNum = pageNum
        scheduler.list().then((schedulers) => {
            if (schedulers["hits"]["total"]["value"] > 0) {
                this.schedulerRunCoreData(schedulers["hits"]["hits"])
                this.schedulerRunWindowPagination()
            }
        })
    }

    // fulfill the frame of the scheduler select and manage window
    schedulerRunWindowCoreData = () => {
        let pageLength = this.schedulerPageLength()
        pageLength === undefined ? this.numRecord = 10 : this.numRecord = parseInt(pageLength)
        scheduler.list().then((schedulers) => {
            if (schedulers["hits"]["total"]["value"] > 0) {
                this.schedulerRunCoreData(schedulers["hits"]["hits"])
                this.schedulerRunWindowPagination()
            }
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
    render = (parentName) => {
        this.addFrame(parentName)
        this.schedulerRunWindowCoreData()
    }

}

export default SchedulerSelectAndManage