/*
   Copyright 2021 Jerome DE LUCCHI


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

import { GSearch, GSearchScrollId } from '../../gsearch.js'

const GSearchList = class {

    constructor() {
        this._pn
        this._gSearchSectionData
        this._gSearchScrollId
        this.frame = `
            <div id="gSearchListContainer" style='overflow-y: scroll; height: 1000px; padding-left: 0'>
                <ul id="gSearchListTable" class="list-group" style="font-size: 12px; padding-left: 0"></ul>
                <div id="gSearchListBottom" class="card" style="display: hidden">
                    <div class="card-body"></div>
                </div>
            </div>`
    }

    set parentName(pn) { this._pn = pn }
    set gSearchSectionData(ssd) { this._gSearchSectionData = ssd }
    set gSearchScrollId(ssi) { this._gSearchScrollId = ssi }

    get parentName() { return this._pn }
    get gSearchSectionData() { return this._gSearchSectionData }
    get gSearchScrollId() { return this._gSearchScrollId }

    addFrame = () => {
        $("#" + this.parentName).html(this.frame)
    }

    gSearchSection = (gSearchDataSet) => {
        let table = document.getElementById("gSearchListTable")
        console.log(gSearchDataSet)
        $.each(gSearchDataSet, (gSearchSectionName, gSearchData) => {
            if ( gSearchSectionName !== 'undefined' ) {
                let ObjectType = gSearchSectionName.split("_")[2]
                console.log(gSearchSectionName, gSearchData)
                gSearchData["data"].forEach((gSearchDataUnit) => {
                    let count = 0
                    let tableRow = document.createElement("li")
                    tableRow.setAttribute("class", "list-group-item blast-gsearch-line")
                    let html = `<div class="row"><div class="col-2" style="display: flex; align-items: center;"><img src="/img/object/` + ObjectType + `.svg" height="48" width="48" /></div><div class="col-10">`
                    if ( ObjectType !== "report") { tableRow.setAttribute("onclick", 'javascript:location.href=\'/html/' + ObjectType + '-details.html?id=' + gSearchDataUnit["_id"] + '\'') }
                    console.log(html)
                    $.each(gSearchDataUnit["_source"], (key, value) => {
                        if ( count === 0 ) {
                            html = html + `<div class="row"><div class="col-4" style="display: flex; align-items: center">` + key + `: ` + value + `</div>`
                        } else if ( count >= 3 ) {
                            html = html + `</div><div class="row"><div class="col-4" style="display: flex; align-items: center">` + key + `: ` + value + `</div>`;
                            count = 0
                        } else {
                            html = html + `<div class="col-4" style="display: flex; align-items: center">` + key + `: ` + value + `</div>`
                        }
                        count += 1
                    })
                    html = html + '</div></div>'
                    table.appendChild(tableRow)
                    tableRow.innerHTML = html
                })
            }
        })
    }

    addGSearchSection = async () => {
        this.gSearchSectionData = {}
        let gSearchString = JSON.parse($.cookie("gSearch"))["string"]
        let gSearchResult = await GSearch(gSearchString)
        this.gSearchScrollId = gSearchResult["_scroll_id"]
        gSearchResult["hits"]["hits"].forEach((gSearchData) => { this.updateGSearchSectionData(gSearchData) })
        this.gSearchSection(this.gSearchSectionData)
    }

    expendGSearchSection = () => {
        this.gSearchSectionData = {}
        GSearchScrollId(this.gSearchScrollId).then((gSearchResult) => {
            gSearchResult["hits"]["hits"].forEach((gSearchData) => { this.updateGSearchSectionData(gSearchData) })
            this.gSearchSection(this.gSearchSectionData)
        })
    }

    updateGSearchSectionData = (gSearchData) => {
        if ( Object.keys(this.gSearchSectionData).includes(gSearchData["_index"]) ) {
            this.gSearchSectionData[gSearchData["_index"]]["count"] += 1
            this.gSearchSectionData[gSearchData["_index"]]["data"].push(gSearchData)
        } else {
            this.gSearchSectionData[gSearchData["_index"]] = { "count": 1, "data": [gSearchData] }
        }
    }

    render(parentName) {
        this.parentName = parentName
        this.addFrame()
        this.addGSearchSection()

        let options = {
            "root": document.querySelector("#gSearchListContainer"),
            "rootMargin": '5px',
            "threshold": 1
        }
        let observer = new IntersectionObserver(this.expendGSearchSection, options)
        let target = document.querySelector("#gSearchListBottom")
        observer.observe(target)
    }
}

export default GSearchList