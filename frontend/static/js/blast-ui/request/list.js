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

import Request from "../../request.js"
import FrontendConfig from "../../frontend.js"
var request = new Request()
var config = new FrontendConfig()

var RequestList = class {

    constructor() {
        this._pn
        this.frame = `
            <nav>
                <div class="nav nav-tabs" id="requests-nav-tab" role="tablist">
                    <button class="nav-link active" aria-controls="activeZone" role="tab" type="button" id="active-requests" data-bs-toggle="tab" data-bs-target="#activeZone">Active</button>
                    <button class="nav-link" aria-controls="completeZone" role="tab" type="button" id="completed-requests" data-bs-toggle="tab" data-bs-target="#completeZone">Complete</button>
                </div>
            </nav>
            <div class="tab-content" id="request-nav-tabContent">
                <div class="tab-pane fade show active" id="activeZone" role="tabpanel" aria-labelledby="nav-active-zone"></div>
                <div class="tab-pane fade" id="completeZone" role="tabpanel" aria-labelledby="nav-complete-zone"></div>
            </div>
        `
        this.activeRequestSenderFrame = `
            <div class="card blast-card shadow-sm mt-3 border">
                <div class="card-body">
                    <div class="card-title">Request sent</div>
                    <p class="card-text" id="activeRequestSender">
                        <table id="activeRequestSenderTable" class="table">
                            <tr>
                                <th>Id</th>
                                <th>State</th>
                                <th>Object</th>
                                <th>Action</th>
                                <th>Sender</th>
                                <th>Receiver</th>
                                <th>Message</th>
                            </tr>
                        </table>
                    </p>
                </div>
            </div>
        `
        this.activeRequestReceiverFrame = `
            <div class="card blast-card shadow-sm mt-3 border">
                <div class="card-body">
                    <div class="card-title">Request received</div>
                    <p class="card-text" id="activeRequestReceiver">
                        <table id="activeRequestReceiverTable" class="table">
                            <tr>
                                <th>Id</th>
                                <th>State</th>
                                <th>Object</th>
                                <th>Action</th>
                                <th>Sender</th>
                                <th>Receiver</th>
                                <th>Message</th>
                            </tr>
                        </table>
                    </p>
                </div>
            </div>
        `
        this.completeRequestSenderFrame = `
            <div class="card blast-card shadow-sm mt-3 border">
                <div class="card-body">
                    <div class="card-title">Request sent</div>
                    <p class="card-text" id="completeRequestSender">
                        <table id="completeRequestSenderTable" class="table">
                            <tr>
                                <th>Id</th>
                                <th>State</th>
                                <th>Object</th>
                                <th>Action</th>
                                <th>Sender</th>
                                <th>Receiver</th>
                                <th>Message</th>
                            </tr>
                        </table>
                    </p>
                </div>
            </div>
        `
        this.completeRequestReceiverFrame = `
             <div class="card blast-card shadow-sm mt-3 border">
                <div class="card-body">
                    <div class="card-title">Request received</div>
                    <p class="card-text" id="completeRequestReceiver">
                        <table id="completeRequestReceiverTable" class="table">
                            <tr>
                                <th>Id</th>
                                <th>State</th>
                                <th>Object</th>
                                <th>Action</th>
                                <th>Sender</th>
                                <th>Receiver</th>
                                <th>Message</th>
                            </tr>
                        </table>
                    </p>
                </div>
             </div>
        `

    }

    set parentName(pn) { this._pn = pn }

    get parentName() { return this._pn }

    addFrame = () => {
        $("#" + this.parentName).html(this.frame)
        this.addSubFrame()
        this.addFrameContent()
    }

    addSubFrame = () => {
        $("#activeZone").html(this.activeRequestSenderFrame + this.activeRequestReceiverFrame)
        $("#completeZone").html(this.completeRequestSenderFrame + this.completeRequestReceiverFrame)
    }

    updateRequestTable = (role, req) => {
        var row = document.createElement("TR")
        var requestTableCols = ["state", "object", "action", "sender", "receiver", "message"]
        var status

        let field = document.createElement("TD")
        let link = document.createElement("A")
        link.setAttribute("href", "/html/request-details.html?id=" + req["_id"])
        let value = document.createTextNode(req["_id"])
        link.appendChild(value)
        field.appendChild(link)
        row.appendChild(field)

        for ( let idx in requestTableCols) {
            let key = requestTableCols[idx]
            if ( key === "state") { status = req["_source"][key] }
            let field = document.createElement("TD")
            console.log(req["_source"][key], key)
            let value = ( key === "action" ) ? document.createTextNode(req["_source"][key]["name"]) : document.createTextNode(req["_source"][key])
            field.appendChild(value)
            row.appendChild(field)
        }

        row.setAttribute("id", req["_id"])
        if (role === "sender") {
            if (status === "new") {
                document.getElementById("activeRequestSenderTable").appendChild(row)
            } else {
                document.getElementById("completeRequestSenderTable").appendChild(row)
            }
        } else if (role === "receiver") {
            if (status == "new") {
                document.getElementById("activeRequestReceiverTable").appendChild(row)
            } else {
                document.getElementById("completeRequestReceiverTable").appendChild(row)
            }
        }
    }

    addFrameContent = () => {
        request.list().then((Resp) => {
            Resp["hits"]["hits"].forEach((req) => {
                console.log(req)
                if (req["_source"]["sender"].includes(config.session.accountEmail)) {
                    this.updateRequestTable("sender", req)
                } else if ( req["_source"]["receiver"].includes(config.session.accountEmail)) {
                    this.updateRequestTable("receiver", req)
                }
            })
        })
    }

    render = (parentName) => {
        this.parentName = parentName
        this.addFrame()
    }
}

export default RequestList