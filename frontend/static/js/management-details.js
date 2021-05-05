/*
 *   Copyright 2020 Jerome DE LUCCHI
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
*/

// import the config with global variables
import FrontendConfig from './frontend.js'
import Script from './script.js'
import Management from './management.js'
let config = new FrontendConfig()
let script = new Script()
let management = new Management()
const rampartUrl = config.proxyURL + '/api/' + config.frontend.version


const setPageTitle = function(pageTitle) {
    $("#navScriptRunName").html(pageTitle)
}

const loadManagementSession = async function(managementId) {
    let data = await management.listById(managementId)
    return data
}

const managementSessionStickerHeader = function(sessionData) {
    return `
        <div class="card blast-card shadow-sm mt-3 border rounded" style="background-color: #FFE873;">
            <div class="card-body">
                <div class="card-title rounded">
                    <div class="row">
                        <div class="col-4"><b>` + sessionData["_source"]["management_run_id"] + `</b><br/>
                            <i>` + sessionData["_source"]["management_run_description"] + `</i></div>
                        <div class="col-4">Management run success: <b>` + sessionData["_source"]["management_run_success"] + `</b></div>
                        <div class="col-4">Runtime: <b>` + sessionData["_source"]["@timestamp"] + `</b></div>
                    </div>
                </div>
            </div>
        </div>`
}

const managementSessionStickerCore = function(runData) {
    let dd = "accordionCore_" + runData["script_run_session"]
    let html = `
        <div class="accordion" id="` + dd + `">
            <div class="card blast-card shadow-sm mt-3 border rounded">
                <div class="card-header" id="headNew_` + dd + `">
                    <button type="button"
                            style="text-decoration: none;"
                            class="btn blast-btn-no-shadow btn-link btn-block text-left"
                            data-toggle="collapse"
                            data-target="#collapseNew_` + dd + `"
                            aria-expanded="true"
                            aria-controls="#collapseNew_` + dd + `">
                            <div class="row rounded p-1">
                                <div class="col-4">Script name: ` + runData["script"] + `
                                    <br />Script session: ` + runData["script_run_session"] + `</div>
                                <div class="col-2">Script success: ` + runData["script_run_success"] + `</div>
                                <div class="col-3">Runtime: ` + runData["at"] + `</div>
                            </div>
                    </button>
                </div>
                <div id="collapseNew_` + dd + `" class="collapse" aria-labelledby="headNew_` + dd + `" data-parent="#` + dd + `">
                    <div class="card-body">
                        <div class="card-text">`

    runData["run_data"].forEach(function(scr) {
        html = html + `
            <table class="table table-striped m-1">
                <tr>
                    <td>hostname: ` + scr["hostname"] + `</td>
                    <td>ok: ` + scr["ok"] + `</td>
                    <td>changed: ` + scr["changed"] + `</td>
                    <td>unreachable: ` + scr["unreachable"] + `</td>
                    <td>failed: ` + scr["failed"] + `</td>
                </tr>
            </table>`
    })

    html = html + `
                    </div>
                    <p style="margin-left: 25px">` + runData["script_run_log"].join('</br>') + `</p>
                </div>
            </div>
        </div>
    </div>`

    return html
}

const loadManagementSessionSticker = function(sessionData) {
    console.log(sessionData)
    let msh = managementSessionStickerHeader(sessionData)
    let msc = ''

    sessionData["_source"]["management_run_data"].forEach(function(runData) {
        msc = msc + managementSessionStickerCore(runData)
    })

    return msh + msc
}

const loadManagementSessionDetails = function() {
    let html = ''
    let urlParams = new URLSearchParams(window.location.href.split('?')[1])
    if (urlParams.has("management_id")) {
        let managementId = urlParams.get("management_id")
        let managementRunId = urlParams.get("management_run_id")
        setPageTitle(managementRunId)
        loadManagementSession(managementId).then(function(managementSession) {
            html = html + loadManagementSessionSticker(managementSession)
            $("#managementSessionStickers").html(html)
        })
    }
}

window.loadManagementSessionDetails = loadManagementSessionDetails