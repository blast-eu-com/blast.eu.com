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

import FrontendConfig from "../../../frontend.js"

var config = new FrontendConfig()

var RequestListInfo = class {

    constructor() {
        this._pn
        this._req
        this.frame = `
            <div class="card">
                <div class="card-body">
                    <div class="card-title"></div>
                    <div class="card-text">
                        <table id="requestInfoTable"></table>
                        <div id="request-actions"></div>
                    </div>
                </div>
            </div>
        `

    }

    get parentName() { return this._pn }
    get request() { return this._req }

    set parentName(pn) { this._pn = pn }
    set request(req) { this._req = req }

    addFrame = () => {
        // $("#" + this.parentName).html(this.frame)
        this.addRequestInfo()
        this.addRequestAction()
    }

    addRequestInfo = () => {
        let requestInfoTableContent = `
            <tr><td>id</td><td>` + this.request.id + `</td></tr>
            <tr><td>object</td><td>` + this.request.object + `</td></tr>
            <tr><td>action.name</td><td>` + this.request.action.name + `</td></tr>
            <tr><td>action.status</td><td>` + this.request.action.status + `</td></tr>
            <tr><td>action.timestamp</td><td>` + this.request.action.timestamp + `</td></tr>
            <tr><td>timestamp</td><td>` + this.request.timestamp + `</td></tr>
            <tr><td>status</td><td>` + this.request.status + `</td></tr>
            <tr><td>sender</td><td>` + this.request.sender + `</td></tr>
            <tr><td>receiver</td><td>` + this.request.receiver + `</td></tr>
            <tr><td>message</td><td>` + this.request.message + `</td></tr>
        `
        $("#requestInfoTable").html(requestInfoTableContent)
        let table = document.getElementById("requestInfoTable")
        table.setAttribute("class", "table")
    }

    addRequestAction = () => {
        let requestActionButton

        if (this.request.status !== "complete") {
            if (this.request.receiver === config.session.accountEmail) {
                requestActionButton = `
                    <a class="btn blast-btn" onclick="acceptRequest('` + this.request.id + `') ;">Accept</a>
                    <a class="btn blast-btn" onclick="rejectRequest('` + this.request.id + `') ;">Reject</a>
                `
            } else if (this.request.sender === config.session.accountEmail) {
                requestActionButton = `
                    <a class="btn blast-btn" onclick="cancelRequest('` + this.request.id + `') ;">Cancel</a>
                `
            }

            $("#request-actions").html(requestActionButton)
        }
    }

    render = (parentName, request) => {
        this.parentName = parentName
        this.request = request
        this.addFrame()
    }

}

export default RequestListInfo