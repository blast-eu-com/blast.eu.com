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

const NodeListInfo = class {

    constructor() {
        this._pn
        this._node
    }

    set parentName(pn) { this._pn = pn }
    set node(nd) { this._node = nd }

    get parentName() { return this._pn }
    get node() { return this._node }

    addListInfo = (node) => {
        let html = `
        <table class="table"><tr><td><b>Node id</b></td><td>` + node.id + `</td></tr>`
        $.each(node.rawData, function(idx, val) {
            if ( idx === "ip" ) {
                html = html + '<tr><td><b>' + idx.charAt(0).toUpperCase() + idx.slice(1) + '</b></td><td>'
                val.sort().forEach(function(nodeIp){
                    html = html + ' <span class="badge blast-badge">' + nodeIp + '</span>'
                })
            } else if ( idx === "mode" ) {
                let htmlSwitch = '<div class="form-check form-switch">'
                if (val === 'running') {
                    htmlSwitch = htmlSwitch + `<input class="form-check-input" type="checkbox" role="switch" id="nodeMode" onchange="updateNodeMode('` + node.id + `') ;" checked>`
                } else {
                    htmlSwitch = htmlSwitch + `<input class="form-check-input" type="checkbox" role="switch" id="nodeMode" onchange="updateNodeMode('` + node.id + `') ;">`
                }
                htmlSwitch = htmlSwitch + '<label class="form-check-label" for="nodeMode">Running</label></div>'
                html = html + '<tr><td><b>' + idx.charAt(0).toUpperCase() + idx.slice(1) + '</b></td><td>' + htmlSwitch + '</td></tr>'
            } else if ( idx !== "roles" && idx !== "peers" ) {
                html = html + '<tr><td><b>' + idx.charAt(0).toUpperCase() + idx.slice(1) + '</b></td><td>' + val + "</td></tr>"
            }
        })
        $("#" + this.parentName).html(html + "</html>")
        return true
    }

    updateNodeMode = (nodeId) => {
        let nodeMode = $("#nodeMode").is(":checked") ? "running" : "maintenance"
        this.node.rawData["mode"] = nodeMode
        this.node.update(nodeId, this.node.rawData).then((updateRes) => {
            if ( Object.keys(updateRes).includes("result") && updateRes["result"] === "updated" ) { location.reload() }
        })
    }

    render = (parentName, node) => {
        this.parentName = parentName
        this.node = node
        this.addListInfo(node)
    }

}

export default NodeListInfo

