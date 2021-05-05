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


const filterStrMatch = function(str, ref) {
    if ( str !== '') {
        let regexp = new RegExp('.*' + str + '.*')
        var bool = (regexp.test(ref)) ? true : false }
    else { var bool = true }
    return bool
}


let Windower = class {

    constructor() {
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


    /* SCRIPT SELECT AND SEARCH WINDOW
     * the script select and search window is used to
     * list and select scripts returned after filtering
     * by name or type */



    /* MANAGEMENT SESSION WINDOW
     * this management session window provide an interface to list and interact
     * the interface is used to access the management result
     */
    managementSessionWindowFrame(parentName) {
        let frame = `
            <div class="form-row">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <div class="input-group-text">
                            <img src="/img/bootstrap-icons-1.0.0-alpha5/search.svg" />
                        </div>
                    </div>
                    <input class="form-control form-control-sm col-6"
                           id="managementSessionNameSearch"
                           type="text"
                           placeholder="Search a management run id" />

                    <select id="selSampleIntervalPicker"
                            class="custom-select custom-select-sm col-1 mx-1">
                        <option value="1">1 hour</option>
                        <option value="12">12 hours</option>
                        <option value="24" selected>1 day</option>
                        <option value="168">1 week</option>
                    </select>

                    <select id="selSampleIntervalCounter"
                            class="custom-select custom-select-sm col-1 mx-1">
                        <option value="1" selected>1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                    </select>

                    <button class="btn btn-sm blast-btn" onclick="managementSessionDisplay()">Display</button>
                </div>

                <div class="card-text mt-2" id="managementSessionWindowFrameCore" style="width: 100%"></div>
                <div class="row m-1 p-1" id="managementSessionWindowInteractive" style="width: 100%"></div>
            </div>
        `
        $('#' + parentName).html(frame)
    }

    managementSessionNameStr() {
        return $("#managementSessionNameSearch").val()
    }

    managementSessionFilter(managementSessionData, managementSessionName) {
        let managementSessionFiltered = []
        console.log(managementSessionData)
        for ( var i=0; i<managementSessionData.length; i++ ) {
            let record = managementSessionData[i]
            console.log(record)
            console.log("val A:" + managementSessionName, "val B:" + record["_source"]["management_run_id"])
            if ( filterStrMatch(managementSessionName, record["_source"]["management_run_id"]) ) {
                managementSessionFiltered.push(record)
            }
        }
        this.curNumRecord = managementSessionFiltered.length
        return managementSessionFiltered
    }

    managementSessionCoreData(managementSessionData) {
        let managementSessionName = this.managementSessionNameStr()
        console.log(managementSessionName)
        let managementSessionFiltered = this.managementSessionFilter(managementSessionData, managementSessionName)
        let firstRec = ( this.curPageNum - 1 ) * this.numRecord
        let lastRec = ( this.curPageNum * this.numRecord )
        let html = ""
        if ( this.curNumRecord > 0) {
            // set table header only if we have management session data
            html = `<table class="table table-striped table-sm">
                <thead>
                <th></th><th>Timestamp</th><th>Identifier</th><th>Descriptor</th><th>Script</th><th>Success</th>
                </thead>`

            if (managementSessionFiltered.length < lastRec ) { lastRec = managementSessionFiltered.length }
            for ( let i=firstRec; i<lastRec; i++) {
                let html_link = `/html/management-details.html?management_run_id=` + managementSessionFiltered[i]["_source"]["management_run_id"] + `&management_id=` + managementSessionFiltered[i]["_id"]
                html = html + `<tr>
                <td class="mx-auto"><img src="/img/bootstrap-icons/terminal.svg" height="16px" width="16px"></td>
                <td>` + new Date(managementSessionFiltered[i]["_source"]["@timestamp"] + 'Z').toLocaleString() + `</td>
                <td><a href="` + html_link + `">` + managementSessionFiltered[i]["_source"]["management_run_id"] + `</a></td>
                <td>` + managementSessionFiltered[i]["_source"]["management_run_description"] + `</td>
                <td>` + managementSessionFiltered[i]["_source"]["management_run_status"] + `</td>`

                if ( managementSessionFiltered[i]["_source"]["management_run_success"] ) {
                    html = html + `<td class="mx-auto">
                        <img src="/img/bootstrap-icons/check-circle.svg"
                             style="margin-left: 10px;"
                             height="16px"
                             width="16px"></td>`
                } else {
                    html = html + `<td class="mx-auto">
                        <img src="/img/bootstrap-icons/x-circle.svg"
                             style="margin-left: 10px;"
                             height="16px"
                             width="16px"></td>`
                }
                html = html + `</tr>`
            }
            html = html + '</table>'
        }
        $("#managementSessionWindowFrameCore").html(html)
        return true
    }

    managementSessionWindowInteractive() {
        $("#managementSessionWindowInteractive").html(`
            <div class="col-1 mt-2">
                <select class="custom-select" id="managementSessionSelSamplePerPage" onchange="managementSessionDisplayNewRange()">
                    <option value="25" selected>25</option>
                    <option value="50">50</option>
                    <option value="75">75</option>
                    <option value="100">100</option>
                </select>
            </div>
            <div class="col-8 mt-2">
                <ul id="managementSessionWindowFramePagination" class="pagination"></ul>
            </div>
        `)
    }

    managementSessionWindowPagination() {
        this.curNumRecord > 1 ? this.firstPage = 1 : this.firstPage = 0
        this.curNumRecord > 1 ? this.lastPage = Math.ceil(this.curNumRecord/this.numRecord) : this.lastPage = 0
        let html = ''
        console.log(this.curNumRecord, this.numRecord)
        if ( this.curNumRecord > this.numRecord ) {
            this.managementSessionWindowInteractive()
            if ( this.lastPage > this.firstPage ) {
                html = `<li class="page-item" onclick="managementSessionGoToPrevPage(` + this.curPageNum + `);">
                    <a class="page-link blast-page-link" href="#">Previous</a></li>`
                for ( let i = this.firstPage; i<=this.lastPage; i++) {
                    html = html + `<li class="page-item"><a class="page-link blast-page-link" onclick="managementSessionGoToThisPage(` + i + `);">` + i + `</a></li>`
                }
                html = html + `<li class="page-item" onclick="managementSessionGoToNextPage(` + this.curPageNum + `,` + this.lastPage + `);">
                    <a class="page-link blast-page-link" href="#">Next</a></li>`
            }
        }
        $("#managementSessionWindowFramePagination").html(html)
        return true
    }

    managementSessionGoToNextPage(curPageNum, lastPage, objectData) {
        let nextPage = curPageNum + 1
        if ( nextPage <= lastPage ) {
            this.curPageNum = nextPage
            this.managementSessionCoreData(objectData)
            this.managementSessionWindowPagination()
        }
    }

    managementSessionGoToPrevPage(curPageNum, objectData) {
        let prevPage = curPageNum - 1
        if ( prevPage > 0 ) {
            this.curPageNum = prevPage
            this.managementSessionCoreData(objectData)
            this.managementSessionWindowPagination()
        }
    }

    managementSessionGoToThisPage(pageNum, objectData) {
        this.curPageNum = pageNum
        this.managementSessionCoreData(objectData)
        this.managementSessionWindowPagination()
    }

    managementSessionWindow(parentName) {
        this.managementSessionWindowFrame(parentName)
    }

    managementSessionWindowCoreData(pageLength, managementSessionData) {
        pageLength === undefined ? this.numRecord = 25 : this.numRecord = parseInt(pageLength)
        this.managementSessionCoreData(managementSessionData)
        this.managementSessionWindowPagination()
    }






    /* SCHEDULE RUN WINDOW
     * this schedule run window provide an interface to list and activate
     * any scheduled scenario
     */
    scheduleRunWindowFrame(parentName) {
        let frame = `
            <div class="input-group">
                <div class="input-group-prepend">
                    <div class="input-group-text">
                        <img src="/img/bootstrap-icons-1.0.0-alpha5/search.svg" />
                    </div>
                </div>
                <input class="form-control form-control-sm" id="scheduleNameSearch" type="text" placeholder="Search a scheduled management scenario" />
                <div class="input-group-append">
                    <button class="btn blast-btn btn-sm" onclick="scheduleRunSearchString();">Search</button>
                </div>
            </div>
            <div id="scheduleRunWindowFrameCore" class="mt-2"></div>
            <div id="scheduleRunWindowInteractive" class="row p-1 m-1"></div>
        `
        $("#" + parentName).html(frame)
    }

    scheduleStringSearch() {
        return $("input#scheduleNameSearch").val()
    }

    filterScheduleData(scheduleData, filterStr) {
        console.log(scheduleData)
        let scheduleDataFiltered = []
        for (let i=0; i<scheduleData.length; i++) {
            let record = scheduleData[i]
            if (filterStrMatch(filterStr, record["_source"]["name"])) {
                scheduleDataFiltered.push(record)
            }
        }
        this.curNumRecord = scheduleDataFiltered.length
        return scheduleDataFiltered
    }

    scheduleRunCoreData(scheduleData) {
        let filterStr = this.scheduleStringSearch()
        let scheduleDataFiltered = this.filterScheduleData(scheduleData, filterStr)
        let firstRec = ( this.curPageNum - 1 ) * this.numRecord
        let lastRec = ( this.curPageNum * this.numRecord )
        let html = '<table class="table table-sm"><tr>'
        if (scheduleDataFiltered.length < lastRec ) { lastRec = scheduleDataFiltered.length }
        for (let i=firstRec; i<lastRec; i++) {
            html = html + `<tr style="display:table-row">
            <td width="50px"><input name="schedule" value="` + scheduleDataFiltered[i]["_id"] + `" type="checkbox" style="margin-left: 10px"/></td>
            <td width="50px"><img src="/img/object/schedule.svg" height="24" width="24"/></td>
            <td width="512px"><a href="/html/scheduler-details.html?scheduler_name=` + scheduleDataFiltered[i]["_source"]["name"] + `&scheduler_id=` + scheduleDataFiltered[i]["_id"] + `">` + scheduleDataFiltered[i]["_source"]["name"] + `</a></td>
            <td>` + scheduleDataFiltered[i]["_source"]["description"] + `</td>
            <td>` + scheduleDataFiltered[i]["_source"]["status"] + `</td>
            </tr>`
        }
        $("#scheduleRunWindowFrameCore").html(html)
        return true
    }

    scheduleRunWindowInteractive() {
        $("#scheduleRunWindowInteractive").html(`
            <div id="scheduleListPerPage" class="col-2 mt-2">
                <select class="custom-select" id="schedulerSelSamplePerPage" onchange="scheduleRunDisplayNewRange()">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                </select>
            </div>
            <div class="col-5 mt-2">
                <nav><ul id="scheduleRunWindowFramePagination" class="pagination"></ul></nav>
            </div>
            <div id="scheduleMenuActions" class="col-5 mt-2">
                <div class="btn-group" style="float: right">
                    <button type="button" class="btn blast-btn" onclick="startSchedule();">Start</button>
                    <button type="button" class="btn blast-btn" onclick="stopSchedule();">Stop</button>
                    <button type="button" class="btn blast-btn" onclick="restartSchedule();">Restart</button>
                </div>
            </div>
        `)
    }

    scheduleRunWindowPagination() {
        this.curNumRecord > 1 ? this.firstPage = 1 : this.firstPage = 0
        this.curNumRecord > 1 ? this.lastPage = Math.ceil(this.curNumRecord/this.numRecord) : this.lastPage = 0
        let html = ''
        if (this.curNumRecord > 0 ) {
            this.scheduleRunWindowInteractive()
            if (this.curNumRecord > this.numRecord) {
                if ( this.lastPage > this.firstPage ) {
                    let html = `<li class="page-item" onclick="scheduleRunGoToPrevPage();">
                        <a class="page-link blast-page-link" href="#">Previous</a></li>`
                    for ( let i = this.firstPage; i<this.lastPage; i++) {
                        html = html + `<li class="page-item">
                            <a class="page-link blast-page-link" onclick="scheduleRunGoToThisPage(` + i + `);">` + i + `</a></li>`
                    }
                    html = html + `<li class="page-item" onclick="scheduleRunGoToNextPage();">
                        <a class="page-link blast-page-link" href="#">Next</a></li>`
                }
            }
        }
        $("#scheduleRunWindowFramePagination").html(html)
        return true
    }

    scheduleRunGoToNextPage(curPageNum, lastPage, objectData) {
        let nextPage = curPageNum + 1
        if ( nextPage <= lastPage ) {
            this.curPageNum = nextPage
            this.scheduleRunCoreData(objectData)
            this.scheduleRunWindowPagination()
        }
    }

    scheduleRunGoToPrevPage(curPageNum, objectData) {
        let prevPage = curPageNum - 1
        if ( prevPage > 0 ) {
            this.curPageNum = prevPage
            this.scheduleRunCoreData(objectData)
            this.scheduleRunWindowPagination()
        }
    }

    scheduleRunGoToThisPage(pageNum, objectData) {
        this.curPageNum = pageNum
        this.scheduleRunCoreData(objectData)
        this.scheduleRunWindowPagination()
    }

    scheduleRunWindow(parentName) {
        this.scheduleRunWindowFrame(parentName)
    }

    scheduleRunWindowCoreData(pageLength, scheduleData) {
        pageLength === undefined ? this.numRecord = 10 : this.numRecord = parseInt(pageLength)
        this.scheduleRunCoreData(scheduleData)
        this.scheduleRunWindowPagination()
    }


    /* TOASTER WINDOW */
    displayToastMsg(toastMsg) {
        $("#toaster").html("")
        $("#toaster").html(`
            <div aria-live="assertive" aria-atomic="true" class="toast fade show" data-delay="10000">
                <div class="toast-header" style="background-color: #FFE873">
                    <strong class="mr-auto">Blast</strong>
                    <small>now</small>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            <div class="toast-body"><h5>` + toastMsg + `</h5></div>
        `)
        $("#toaster").toast("show")
    }

}

export default Windower
