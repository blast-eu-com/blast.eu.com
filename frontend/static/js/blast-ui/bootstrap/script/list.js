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
import Script from '../../../script.js'
var script = new Script()
var ScriptList = class {

    constructor() {
        this.nr = 10                // number of record per page
        this.cn = 0                 // current number of record
        this.lp = 1                 // last page
        this.fp = 1                 // first page
        this.cp = 1                 // current page
        this.pn = ''
        this.frame = `
            <div id="simpleWindowFrameCore" class="mt-2"></div>
            <div id="simpleWindowInteractive" class="row p-1 m-1"></div>
        `
        this.msgScriptNotFound = `<div class="p-5" style="text-align: center;">
        <img src="/img/object/script.svg" width="92" height="92"><b><h3 class="mt-3">SCRIPT NOT FOUND</h3></b>
        Add a script from this page\'s form to see it appearing into this list.</div>`
    }

    set parentName(pn) { this.pn = pn }
    set numRecord(nr) { this.nr = nr }
    set curNumRecord(cn) { this.cn = cn }
    set lastPage(lp) { this.lp = lp }
    set firstPage(fp) { this.fp = fp }
    set curPageNum(cp) { this.cp = cp }

    get parentName() { return this.pn }
    get numRecord() { return this.nr }
    get curNumRecord() { return this.cn }
    get lastPage() { return this.lp }
    get firstPage() { return this.fp }
    get curPageNum() { return this.cp }

    addFrame = (parentName) => {
        $('#' + parentName).html(this.frame)
    }

    windowCoreData(objectData) {
        let recId = objectData["_id"]
        let objName = objectData["_index"]
        let html =`
            <a id="script-img"
                class="card bg-gradient rounded h-100" style="background-color: #D9D9D9; border: 1px solid #CCCCCC"
                href="/html/script-details.html?script_id=` + recId + `&script_name=` + objectData["_source"]["name"] + `">
                    <img src="/img/script/` + objectData["_source"]["type"] + `.svg" class="card-img-top mt-3 py-3" height="86" width="86" />
                    <div class="card-body border-top bg-gradient text-white" style="background-color: #4B8BBE">
                        <div class="card-title fw-bold">` + objectData["_source"]["name"] + `</div>
                        <span style="font-size: 12px;">` + objectData["_source"]["description"] + `</span><br>
                    </div>
                    <div class="card-footer bg-gradient text-center text-dark" style="background-color: #FFD43B">
                        <span class="fw-lighter" style="font-size: 10px;">` + recId + `</span>
                    </div>
                </a>`

        return html
    }

    simpleListCoreData(objectData) {
        this.curNumRecord = objectData.length
        let firstRec = ( this.curPageNum - 1 ) * this.numRecord
        let lastRec = ( this.curPageNum * this.numRecord )
        let html = ''
        if (objectData.length < lastRec ) { lastRec = objectData.length }

        for ( let i=firstRec; i<lastRec; i++) {
            if ( i % 6 === 0 && i === firstRec ) {
                html = html + `<div class="row mb-2">`
            } else if ( i % 6 === 0 && i !== firstRec ) {
                html = html + `</div><div class="row mb-2">`
            }

            let recId = objectData[i]["_id"]
            let objName = objectData[i]["_index"]
            html = html + `<div class="col-2">` + this.windowCoreData(objectData[i]) + `</div>`
        }
        $("#simpleWindowFrameCore").html(html)
        return true
    }

    simpleWindowInteractive() {
        $("#simpleWindowInteractive").html(`
            <div class="col-1 mt-2">
                <select id="selSamplePerPage" class="custom-select" onchange="simpleListWindowDisplayNewRange()">
                    <option value="10" selected>10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </div>
            <div class="col-8 mt-2">
                <ul id="simpleWindowFramePagination" class="pagination"></ul>
            </div>
        `)
    }

    simpleListWindowPagination() {
        this.firstPage = (this.curNumRecord > 1) ? 1 : 0
        this.lastPage = (this.curNumRecord > 1) ? Math.ceil(this.curNumRecord/this.numRecord) : 0
        let html = ''
        if ( this.curNumRecord > this.numRecord ) {
            this.simpleWindowInteractive()
            if (this.lastPage > this.firstPage) {
                html = `<li class="page-item" onclick="simpleListGoToPrevPage(` + this.curPageNum + `);">
                    <a class="page-link blast-page-link" href="#">Previous</a></li>`
                for ( let i = this.firstPage; i<=this.lastPage; i++) {
                    html = html + `<li class="page-item"><a class="page-link blast-page-link" onclick="simpleListGoToThisPage(` + i + `);">` + i + `</a></li>`
                }
                html = html + `<li class="page-item" onclick="simpleListGoToNextPage(` + this.curPageNum + `,` + this.lastPage + `);">
                    <a class="page-link blast-page-link" href="#">Next</a></li>`
            }
        }
        $("#simpleWindowFramePagination").html(html)
        return true
    }

    // navigate thru data
    // go to previous page of the current page
    simpleListGoToPrevPage(curPageNum) {
        let prevPage = curPageNum - 1
        if ( prevPage > 0 ) {
            this.curPageNum = prevPage
            script.list().then((scripts) => {
                if (scripts["hits"]["total"]["value"] > 0) {
                    this.simpleListCoreData(scripts["hits"]["hits"])
                    this.simpleListWindowPagination()
                }
            })
        }
    }

    // navigate thru data
    // go to the specified page
    simpleListGoToThisPage(pageNum) {
        this.curPageNum = pageNum
        script.list().then((scripts) => {
            if (scripts["hits"]["total"]["value"] > 0) {
                this.simpleListCoreData(scripts["hits"]["hits"])
                this.simpleListWindowPagination()
            }
        })
    }

    // navigate thru data
    // go to the next page of the current page
    simpleListGoToNextPage(curPageNum, lastPage) {
        let nextPage = curPageNum + 1
        if ( nextPage <= lastPage ) {
            this.curPageNum = nextPage
            script.list().then((scripts) => {
                if (scripts["hits"]["total"]["value"] > 0) {
                    this.simpleListCoreData(scripts["hits"]["hits"])
                    this.simpleListWindowPagination()
                }
            })
        }
    }

    simpleListWindowCoreData() {
        try {
            let pageLength = $("select#selSamplePerPage option:selected").val()
            pageLength === undefined ? this.numRecord = 10 : this.numRecord = parseInt(pageLength)
            script.list().then((scripts) => {
                if (scripts["hits"]["total"]["value"] > 0) {
                    this.simpleListCoreData(scripts["hits"]["hits"])
                    this.simpleListWindowPagination()
                } else {
                    throw 'noScriptsFound'
                }
            })
        } catch (e) {
            if (e === 'noScriptsFound') {
                $("#" + this.parentName).html(this.msgScriptNotFound)
            }
        }
    }

    render = (parentName) => {
        this.parentName = parentName
        this.addFrame(this.parentName)
        this.simpleListWindowCoreData()
    }
}


export default ScriptList
