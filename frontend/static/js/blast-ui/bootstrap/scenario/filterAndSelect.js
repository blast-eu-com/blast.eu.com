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
import Scenario from '../../../scenario.js'
var scenario = new Scenario()

var ScenarioFilterAndSelect = class {

    constructor(parentName) {
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


    addFrame(parentName) {
        $('#' + parentName).html(`
            <div class="input-group">
                <div class="input-group-text"><img src="/img/bootstrap-icons-1.0.0-alpha5/search.svg" /></div>
                <input class="form-control form-control-sm" id="scenarioNameSearch" type="text" placeholder="Search a scenario" />
                <button class="btn blast-btn btn-sm" onclick="scenarioSearchString();">Search</button>
            </div>
            <div id="scenarioSearchWindowFrameCore" class="mt-2"></div>
            <div id="scenarioSearchWindowInteractive" class="row p-1 m-1"></div>
        `)
    }

    scenarioPageLength() {
        return $("select#scenarioSelSamplePerPage option:selected").val()
    }

    scenarioStringSearch() {
        return $("input#scenarioNameSearch").val()
    }

    filterStrMatch(str, ref) {
        if ( str !== '') {
            let regexp = new RegExp('.*' + str + '.*')
            var bool = (regexp.test(ref)) ? true : false }
        else { var bool = true }
        return bool
    }

    filterScenarioData = (scenarioData, filterStr) => {
        let scenarioDataFiltered = []
        for (let i=0; i<scenarioData.length; i++) {
            let record = scenarioData[i]
            if (this.filterStrMatch(filterStr, record["_source"]["name"])) {
                scenarioDataFiltered.push(record)
            }
        }
        this.cn = scenarioDataFiltered.length
        return scenarioDataFiltered
    }

    scenarioSearchWindowCoreData = (scenarioData) => {
        let filterStr = this.scenarioStringSearch()
        let scenarioDataFiltered = this.filterScenarioData(scenarioData, filterStr)
        let firstRec = ( this.curPageNum - 1 ) * this.numRecord
        let lastRec = ( this.curPageNum * this.numRecord )
        let html = '<table class="table"><tr>'
        if (scenarioDataFiltered.length < lastRec ) { lastRec = scenarioDataFiltered.length }
        for (let i=firstRec; i<lastRec; i++) {
            html = html + `<tr style="display:table-row">
            <td width="50px"><input name="scenario" value="` + scenarioDataFiltered[i]["_id"] + `" type="checkbox" style="margin-left: 10px;"/></td>
            <td width="50px"><img src="/img/bootstrap-icons/terminal.svg" height="24" width="24"/></td>
            <td width="512px"><a href="/html/managementsce-details.html?scenario_id=` + scenarioDataFiltered[i]["_id"] + `&scenario_name=` + scenarioDataFiltered[i]["_source"]["name"] + `">` + scenarioDataFiltered[i]["_source"]["name"] + `</a></td>
            <td>` + scenarioDataFiltered[i]["_source"]["description"] + `</td>
            </tr>`
        }
        $("#scenarioSearchWindowFrameCore").html(html)
        return true
    }

    scenarioSearchWindowInteractive() {
        $("#scenarioSearchWindowInteractive").html(`
            <div class="col-2">
                <select class="form-select" id="scenarioSelSamplePerPage" onchange="scenarioDisplayNewRange()">
                    <option value="10" selected>10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                </select>
            </div>
            <div class="col-10">
                <nav><ul id="scenarioSearchWindowFramePagination" class="pagination"></ul></nav>
            </div>
        `)
    }

    scenarioSearchWindowPagination() {
        this.curNumRecord > 1 ? this.firstPage = 1 : this.firstPage = 0
        this.curNumRecord > 1 ? this.lastPage = Math.ceil(this.curNumRecord/this.numRecord) : this.lastPage = 0
        let html = ''
        console.log(this.curNumRecord, this.numRecord)
        if ( this.curNumRecord > this.numRecord ) {
            this.scenarioSearchWindowInteractive()
            console.log(this.lastPage, this.firstPage)
            if ( this.lastPage > this.firstPage ) {
                html = `<li class="page-item" onclick="scenarioSearchGoToPrevPage();">
                    <a class="page-link blast-page-link" href="#">Previous</a></li>`
                for ( let i = this.firstPage; i<=this.lastPage; i++) {
                    html = html + `<li class="page-item">
                        <a class="page-link blast-page-link" onclick="scenarioSearchGoToThisPage(` + i + `);">` + i + `</a></li>`
                }
                html = html + `<li class="page-item" onclick="scenarioSearchGoToNextPage();">
                    <a class="page-link blast-page-link" href="#">Next</a></li>`
            }
        }
        console.log(html)
        $("#scenarioSearchWindowFramePagination").html(html)
        return true
    }

    // navigate thru scenario data
    // go to the next page of the current
    scenarioSearchGoToNextPage(curPageNum, lastPage, objectData) {
        let nextPage = curPageNum + 1
        if ( nextPage <= lastPage ) {
            this.curPageNum = nextPage
            scenario.list().then((scenarios) => {
                if (scenarios["hits"]["total"]["value"] > 0) {
                    this.scenarioSearchWindowCoreData(objectData)
                    this.scenarioSearchWindowPagination()
                }
            })
        }
    }

    // navigate thru scenario data
    // go to the prev page of the current
    scenarioSearchGoToPrevPage = (curPageNum) => {
        let prevPage = curPageNum - 1
        if ( prevPage > 0 ) {
            this.curPageNum = prevPage
            scenario.list().then((scenarios) => {
                if (scenarios["hits"]["total"]["value"] > 0) {
                    this.scenarioSearchWindowCoreData(scenarios["hits"]["hits"])
                    this.scenarioSearchWindowPagination()
                }
            })
        }
    }

    // navigate thru scenario data
    // go to the specified page
    scenarioSearchGoToThisPage = (pageNum) => {
        this.curPageNum = pageNum
        scenario.list().then((scenarios) => {
            if (scenarios["hits"]["total"]["value"] > 0) {
                this.scenarioSearchWindowCoreData(scenarios["hits"]["hits"])
                this.scenarioSearchWindowPagination()
            }
        })
    }

    // fulfill the filter and select window frame
    scenarioSearchWindowFrameCore = () => {
        let pageLength = this.scenarioPageLength()
        pageLength === undefined ? this.numRecord = 10 : this.numRecord = parseInt(pageLength)
        scenario.list().then((scenarios) => {
            if (scenarios["hits"]["total"]["value"] > 0) {
                this.scenarioSearchWindowCoreData(scenarios["hits"]["hits"])
                this.scenarioSearchWindowPagination()
            }
        })
    }

    loadScenarioScriptUIHeader = () => {
        script.listLang().then((scriptLangsData) => {
            windower.scriptSelectAndSearchWindow("managementUIScriptFrame", scriptLangsData["hits"]["hits"])
        })
    }

    loadScenarioScriptUICore = () => {
        let pageLength = $("select#scriptSelSamplePerPage option:selected").val()
        script.list().then((scriptData) => {
            windower.scriptSelectAndSearchWindowData(pageLength, scriptData["hits"]["hits"])
        })
    }

    loadScenarioScriptUI = () => {
        let pageLength = $("select#scriptSelSamplePerPage option:selected").val()
        script.list().then((scriptData) => {
            if ( scriptData["hits"]["total"]["value"] > 0) {
                loadScenarioScriptUIHeader()
                loadScenarioScriptUICore()
            } else { $("#managementUIScriptFrame").html(msgScriptNotFound) }
        })
    }

    // return the filter and select window
    render = (parentName) => {
        this.parentName = parentName
        this.scenarioSearchWindowFrameCore()
    }

}

export default ScenarioFilterAndSelect