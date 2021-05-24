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

const ScriptFilterAndSelect = class {

    constructor(parentName) {
        this.parentName = parentName
        this.frame = `
            <div class="input-group">
                <div class="input-group-text">
                    <img src="/img/bootstrap-icons-1.0.0-alpha5/search.svg" />
                </div>
                <input class="form-control form-control-sm" id="scriptNameSearch" type="text" />
                <select id="scriptTypeSelect" class="form-select form-select-sm col-3 mx-1"></select>
                <button class="btn blast-btn btn-sm" onclick="scriptSearchString();">Search</button>
            </div>
            <div id="selectAndSearchWindowFrameCore" class="mt-2"></div>
            <div id="scriptSearchWindowInteractive" class="row p-1 m-1"></div>

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

    addFrame = async () => {
        $("#" + this.parentName).html(this.frame)
        let selectOptions = '<option value="any">any</option>'
        let selectData = await script.listLang()
        console.log(selectData)
        selectData["hits"]["hits"].forEach((selectOption) => {
            console.log(selectOption)
            selectOptions = selectOptions + '<option value="' + selectOption["_source"]["name"] + '">' + selectOption["_source"]["name"] + '</option>'
        })
        $("#scriptTypeSelect").html(selectOptions)
        return true
    }

    filterStrMatch = (str, ref) => {
        if ( str !== '') {
            let regexp = new RegExp('.*' + str + '.*')
            var bool = (regexp.test(ref)) ? true : false }
        else { var bool = true }
        return bool
    }

    scriptTypeSelected() {
        return $("select#scriptTypeSelect option:selected").val()
    }

    scriptStringSearch() {
        return $("input#scriptNameSearch").val()
    }

    filterByScriptType(scriptType, type) {
        let bool = ( scriptType === 'any' || scriptType === type ) ? true : false
        return bool
    }

    filterScriptData(scriptData, scriptType, scriptStr) {
        console.log('script value ' + scriptData)
        let scriptDataFiltered = []
        for ( let i=0; i<scriptData.length; i++ ) {
            let record = scriptData[i]
            console.log(record, i, scriptData.length)
            let filterType = this.filterByScriptType(scriptType, record["_source"]["type"])
            let filterStr = this.filterStrMatch(scriptStr, record["_source"]["name"])
            if (filterType && filterStr) { scriptDataFiltered.push(record) }
        }
        this.curNumRecord = scriptDataFiltered.length
        return scriptDataFiltered
    }

    scriptSelectAndSearchWindowCoreData(scriptData) {
        let scriptType = this.scriptTypeSelected()
        let scriptStr = this.scriptStringSearch()
        let scriptDataFiltered = this.filterScriptData(scriptData, scriptType, scriptStr)
        let firstRec = ( this.curPageNum - 1 ) * this.numRecord
        let lastRec = ( this.curPageNum * this.numRecord )
        let html = `<table class="table table-sm">
            <thead><tr>
                <th></th>
                <th></th>
                <th>Name</th>
                <th>File name</th>
                <th>Description</th>
            </tr></thead>`
        let scriptIcon = 'undefined'
        console.log(firstRec, lastRec, scriptDataFiltered.length)
        if (scriptDataFiltered.length < lastRec ) { lastRec = scriptDataFiltered.length }
        console.log('---*---')
        console.log(firstRec, lastRec)
        for ( let i=firstRec; i<lastRec; i++) {
            if ( Object.keys(JSON.parse($.cookie('scriptlangs'))).includes(scriptDataFiltered[i]["_source"]["type"]) ) {
                scriptIcon = "/img/script/" + JSON.parse($.cookie('scriptlangs'))[scriptDataFiltered[i]["_source"]["type"]]
            } else {
                scriptIcon = "/img/bootstrap-icons/file-code.svg"
            }
            html = html + `<tr style="display:table-row">
            <td width="50px"><input name="scr" value="` + scriptDataFiltered[i]["_source"]["name"] + `" type="checkbox" style="margin-left: 10px"/></td>
            <td width="50px"><img src="` + scriptIcon + `" height="24" width="24" /></td>
            <td>` + scriptDataFiltered[i]["_source"]["name"] + `</td>
            <td>` + scriptDataFiltered[i]["_source"]["filename"] + `</td>
            <td>` + scriptDataFiltered[i]["_source"]["description"] + `</td>
            </tr>`
        }
        $("#selectAndSearchWindowFrameCore").html(html)
        return true
    }

    scriptWindowInteractive() {
        $("#scriptSearchWindowInteractive").html(`
            <div class="col-2">
                <select id="scriptSelSamplePerPage" class="custom-select" onchange="scriptSearchWindowDisplayNewRange()">
                    <option value="10" selected>10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                </select>
            </div>
            <div class="col-10">
                <nav><ul id="scriptSearchWindowFramePagination" class="pagination"></ul></nav>
            </div>
        `)
    }

    scriptSelectAndSearchWindowPagination() {
        this.curNumRecord > 1 ? this.firstPage = 1 : this.firstPage = 0
        this.curNumRecord > 1 ? this.lastPage = Math.ceil(this.curNumRecord/this.numRecord) : this.lastPage = 0
        let html = ''
        if ( this.curNumRecord > this.numRecord ) {
            this.scriptWindowInteractive()
            if ( this.lastPage > this.firstPage ) {
                html = `<li class="page-item" onclick="scriptSelectAndSearchGoToPrevPage(` + this.curPageNum + `);">
                    <a class="page-link blast-page-link" href="#">Previous</a></li>`
                for ( let i = this.firstPage; i<=this.lastPage; i++) {
                    html = html + `<li class="page-item"><a class="page-link blast-page-link" onclick="scriptSelectAndSearchGoToThisPage(` + i + `);">` + i + `</a></li>`
                }
                html = html + `<li class="page-item" onclick="scriptSelectAndSearchGoToNextPage(` + this.curPageNum + `,` + this.lastPage + `);">
                    <a class="page-link blast-page-link" href="#">Next</a></li>`
            }
        }
        $("#scriptSearchWindowFramePagination").html(html)
        return true
    }

    scriptSelectAndSearchGoToNextPage(curPageNum, lastPage) {
        let nextPage = curPageNum + 1
        if ( nextPage <= lastPage ) {
            this.curPageNum = nextPage
            script.list().then((scripts) => {
                if (scripts["hits"]["total"]["value"] > 0) {
                    this.scriptSelectAndSearchWindowCoreData(scripts["hits"]["hits"])
                    this.scriptSelectAndSearchWindowPagination()
                }
            })
        }
    }

    scriptSelectAndSearchGoToPrevPage(curPageNum) {
        let prevPage = curPageNum - 1
        if ( prevPage > 0 ) {
            this.curPageNum = prevPage
            script.list().then((scripts) => {
                if (scripts["hits"]["total"]["value"] > 0) {
                    this.scriptSelectAndSearchWindowCoreData(scripts["hits"]["hits"])
                    this.scriptSelectAndSearchWindowPagination()
                }
            })
        }
    }

    scriptSelectAndSearchGoToThisPage(pageNum) {
        this.curPageNum = pageNum
        script.list().then((scripts) => {
            if (scripts["hits"]["total"]["value"] > 0) {
                this.scriptSelectAndSearchWindowCoreData(scripts["hits"]["hits"])
                this.scriptSelectAndSearchWindowPagination()
            }
        })
    }

    scriptSearchString(scriptData) {
        this.scriptSelectAndSearchWindowCoreData(scriptData)
        this.scriptSelectAndSearchWindowPagination()
    }

    scriptSelectAndSearchWindow(parentName, selectData) {
        this.scriptSelectAndSearchWindowFrame(parentName, selectData)
    }

    scriptSelectAndSearchWindowData() {
        try {
            let pageLength = $("select#scriptSelSamplePerPage option:selected").val()
            pageLength === undefined ? this.numRecord = 10 : this.numRecord = parseInt(pageLength)
            script.list().then((scripts) => {
                if (scripts["hits"]["total"]["value"] > 0) {
                    this.scriptSelectAndSearchWindowCoreData(scripts["hits"]["hits"])
                    this.scriptSelectAndSearchWindowPagination()
                } else {
                    throw 'noScriptsFound'
                }
            })
        } catch (e) {
            console.log('no scripts')
        }
    }

    runScripts = () => {
        let scriptList = []
        $("input[name='scr']").each(function(data, tag) {
            if ( tag.checked ) { scriptList.push(tag.value) }
        })
        return scriptList
    }

    runScriptsId = async () => {
        let scriptsId = []
        let scriptsData = await script.listByNames(this.runScripts())
        for ( let i=0; i<scriptsData["hits"]["hits"].length; i++) { scriptsId.push(scriptsData["hits"]["hits"][i]["_id"]) }
        return scriptsId
    }

    render = () => {
        this.addFrame()
        this.scriptSelectAndSearchWindowData()
    }
}

export default ScriptFilterAndSelect
