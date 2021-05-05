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

var ManagementFilter = class {

    constructor() {

        this.sampleIntervalPicker = 24
        this.sampleIntervalCounter = 1
        this.samplePerPage = 5
        this.samplePageNum = 1
        this.samplePageMax = 1

    }

    set ManagementSampleIntervalPicker(SIP) { this.sampleIntervalPicker = SIP }
    set ManagementSampleIntervalCounter(SIC) { this.sampleIntervalCounter = SIC }
    set ManagementSamplePerPage(SPP) { this.samplePerPage = SPP }
    set ManagementSamplePageNum(SPN) { this.samplePageNum = SPN }
    set ManagementSamplePageMax(SPM) { this.samplePageMax = SPM }

    get ManagementSampleIntervalPicker() { return this.sampleIntervalPicker }
    get ManagementSampleIntervalCounter() { return this.sampleIntervalCounter }
    get ManagementSamplePerPage() { return this.samplePerPage }
    get ManagementSamplePageNum() { return this.samplePageNum }
    get ManagementSamplePageMax() { return this.samplePageMax }

    managementWindowFrame(parentName) {
        let frame = `
            <div class="form-row">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <div class="input-group-text">
                            <img src="/img/bootstrap-icons-1.0.0-alpha5/search.svg" />
                        </div>
                    </div>
                    <input class="form-control form-control-sm col-6"
                           id="managementNameSearch"
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

                    <button class="btn btn-sm blast-btn" onclick="managementDisplay()">Display</button>
                </div>

                <div class="card-text mt-2" id="managementWindowFrameCore" style="width: 100%"></div>
                <div class="row m-1 p-1" id="managementWindowInteractive" style="width: 100%"></div>
            </div>
        `
        $('#' + parentName).html(frame)
    }

    managementNameStr() {
        return $("#managementNameSearch").val()
    }

    managementFilter(managementData, managementName) {
        let managementFiltered = []
        console.log(managementData)
        for ( var i=0; i<managementData.length; i++ ) {
            let record = managementData[i]
            console.log(record)
            console.log("val A:" + managementName, "val B:" + record["_source"]["management_run_id"])
            if ( filterStrMatch(managementName, record["_source"]["management_run_id"]) ) {
                managementFiltered.push(record)
            }
        }
        this.curNumRecord = managementFiltered.length
        return managementFiltered
    }

    managementCoreData(managementData) {
        let managementName = this.managementNameStr()
        console.log(managementName)
        let managementFiltered = this.managementFilter(managementData, managementName)
        let firstRec = ( this.curPageNum - 1 ) * this.numRecord
        let lastRec = ( this.curPageNum * this.numRecord )
        let html = ""
        if ( this.curNumRecord > 0) {
            // set table header only if we have management session data
            html = `<table class="table table-striped table-sm">
                <thead>
                <th></th><th>Timestamp</th><th>Identifier</th><th>Descriptor</th><th>Script</th><th>Success</th>
                </thead>`

            if (managementFiltered.length < lastRec ) { lastRec = managementFiltered.length }
            for ( let i=firstRec; i<lastRec; i++) {
                let html_link = `/html/management-details.html?management_run_id=` + managementFiltered[i]["_source"]["scenario_ids"] + `&management_id=` + managementFiltered[i]["_id"]
                html = html + `<tr>
                <td class="mx-auto"><img src="/img/bootstrap-icons/terminal.svg" height="16px" width="16px"></td>
                <td>` + new Date(managementFiltered[i]["_source"]["@timestamp"] + 'Z').toLocaleString() + `</td>
                <td><a href="` + html_link + `">` + managementFiltered[i]["_source"]["scenario_ids"] + `</a></td>
                <td>` + managementFiltered[i]["_source"]["start_at"] + `</td>
                <td>` + managementFiltered[i]["_source"]["end_at"] + `</td>
                <td>` + managementFiltered[i]["_source"]["status"] + `</td>`

                if ( managementFiltered[i]["_source"]["management_run_success"] ) {
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
        $("#managementWindowFrameCore").html(html)
        return true
    }

    managementWindowInteractive() {
        $("#managementWindowInteractive").html(`
            <div class="col-1 mt-2">
                <select class="custom-select" id="managementSelSamplePerPage" onchange="managementDisplayNewRange()">
                    <option value="25" selected>25</option>
                    <option value="50">50</option>
                    <option value="75">75</option>
                    <option value="100">100</option>
                </select>
            </div>
            <div class="col-8 mt-2">
                <ul id="managementWindowFramePagination" class="pagination"></ul>
            </div>
        `)
    }

    managementWindowPagination() {
        this.curNumRecord > 1 ? this.firstPage = 1 : this.firstPage = 0
        this.curNumRecord > 1 ? this.lastPage = Math.ceil(this.curNumRecord/this.numRecord) : this.lastPage = 0
        let html = ''
        console.log(this.curNumRecord, this.numRecord)
        if ( this.curNumRecord > this.numRecord ) {
            this.managementWindowInteractive()
            if ( this.lastPage > this.firstPage ) {
                html = `<li class="page-item" onclick="managementGoToPrevPage(` + this.curPageNum + `);">
                    <a class="page-link blast-page-link" href="#">Previous</a></li>`
                for ( let i = this.firstPage; i<=this.lastPage; i++) {
                    html = html + `<li class="page-item"><a class="page-link blast-page-link" onclick="managementGoToThisPage(` + i + `);">` + i + `</a></li>`
                }
                html = html + `<li class="page-item" onclick="managementGoToNextPage(` + this.curPageNum + `,` + this.lastPage + `);">
                    <a class="page-link blast-page-link" href="#">Next</a></li>`
            }
        }
        $("#managementSessionWindowFramePagination").html(html)
        return true
    }

    managementGoToNextPage(curPageNum, lastPage, objectData) {
        let nextPage = curPageNum + 1
        if ( nextPage <= lastPage ) {
            this.curPageNum = nextPage
            this.managementCoreData(objectData)
            this.managementWindowPagination()
        }
    }

    managementGoToPrevPage(curPageNum, objectData) {
        let prevPage = curPageNum - 1
        if ( prevPage > 0 ) {
            this.curPageNum = prevPage
            this.managementCoreData(objectData)
            this.managementWindowPagination()
        }
    }

    managementGoToThisPage(pageNum, objectData) {
        this.curPageNum = pageNum
        this.managementCoreData(objectData)
        this.managementWindowPagination()
    }

    managementWindow(parentName) {
        this.managementWindowFrame(parentName)
    }

    managementWindowCoreData(pageLength, managementData) {
        pageLength === undefined ? this.numRecord = 25 : this.numRecord = parseInt(pageLength)
        this.managementCoreData(managementData)
        this.managementWindowPagination()
    }

}

export function managementGoToPrevPage(pageNum) {
    management.listSessByTimeRange(sce.ManagementSampleIntervalCounter * sce.ManagementSampleIntervalPicker).then(function(managementSessionData) {
        managementFilter.managementSessionGoToPrevPage(pageNum, managementSessionData["hits"]["hits"])
    })
}
export function managementGoToNextPage(pageNum, lastPage) {
    management.listSessByTimeRange(sce.ManagementSampleIntervalCounter * sce.ManagementSampleIntervalPicker).then(function(managementSessionData) {
        managementFilter.managementSessionGoToNextPage(pageNum, lastPage, managementSessionData["hits"]["hits"])
    })
}
export function managementGoToThisPage(pageNum) {
    management.listSessByTimeRange(sce.ManagementSampleIntervalCounter * sce.ManagementSampleIntervalPicker).then(function(managementSessionData) {
        managementFilter.managementSessionGoToThisPage(pageNum, managementSessionData["hits"]["hits"])
    })
}

export function managementDisplayNewRange() {
    let perPage = $("select#managementSelSamplePerPage option:selected").val()
    management.ManagementSamplePerPage = perPage
    management.listSessByTimeRange(sce.ManagementSampleIntervalPicker * sce.ManagementSampleIntervalCounter).then(function(managementSessionData) {
        managementFilter.managementSessionWindowCoreData(sce.ManagementSamplePerPage, managementSessionData["hits"]["hits"])
    })
}

export default ManagementFilter