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

import Script from '../../script.js'
var script = new Script()

var ScriptList = class {

    constructor() {
        this.msgScriptNotFound = `<div class="p-5" style="text-align: center;">
        <img src="/img/object/script.svg" width="92" height="92"><b><h3 class="mt-3">SCRIPT NOT FOUND</h3></b>
        Add a script from this page\'s form to see it appearing into this list.</div>`
    }

    templateScript = (scriptData) => {
        let html = `<div class="row mb-2">`
        let colNum = 0
        scriptData.forEach((scr) => {
            if (colNum === 6) {
                html = html + `</div><div class="row mb-2">`
                colNum = 0
            }
            html = html + `
                <div class="col-sm-2">
                    <a id="script-img"
                        class="card bg-gradient rounded h-100 border-0"
                        href="/html/script-details.html?id=` + scr["_id"] + `">
                        <img src="/img/hexa_blue_background.jpg" style="opacity: 0.85;">
                        <img src="/img/script/` + scr["_source"]["type"] + `.svg" class="card-img-top mt-3 py-3" height="92" width="92" style="position: absolute" />
                        <div class="card-body bg-gradient text-center text-dark" style="position: absolute; top: 42.5%; width: 100%">
                            <div class="card-title" style="font-size: 16px">` + scr["_source"]["name"] + `</div>
                            <span style="font-size: 12px;">` + scr["_source"]["description"] + `</span><br>
                        </div>
                        <div class="card-footer bg-gradient text-center text-dark p-0 border-0" style="background-color: #FFE873">
                            <span class="fw-lighter" style="font-size: 12px;">` + scr["_id"] + `</span>
                        </div>
                    </a>
                </div>
            `
            colNum += 1
        })
        return html
    }

    loadScriptList = () => {
        script.list().then((scriptData) => {
            $("#scriptListPagination").pagination({
                dataSource: scriptData["hits"]["hits"],
                pageSize: 60,
                callback: (data, pagination) => {
                    let html = this.templateScript(data)
                    $("#scriptList").html(html)
                }
            })
        })
    }

    render = () => {
        this.loadScriptList()
    }
}


export default ScriptList
