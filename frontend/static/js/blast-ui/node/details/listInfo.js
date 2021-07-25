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

const NodeListInfo = class {

    constructor() {
        this._pn
    }

    set parentName(pn) { this._pn = pn }

    get parentName() { return this._pn }

    addListInfo = (node) => {
        let html = `<img style="margin-left: 1rem; margin-bottom: 1rem" src="/img/object/node.svg" height="56" width="56" />
        <table class="table"><tr><td><b>Node id</b></td><td>` + node.id + `</td></tr>`
        $.each(node.rawData, function(idx, val) {
            if ( idx === "ip" ) {
                html = html + '<tr><td><b>' + idx.charAt(0).toUpperCase() + idx.slice(1) + '</b></td><td>'
                val.sort().forEach(function(nodeIp){
                    html = html + ' <span class="badge blast-badge">' + nodeIp + '</span>'
                })
            } else if ( idx !== "roles" && idx !== "peers" ) {
                html = html + '<tr><td><b>' + idx.charAt(0).toUpperCase() + idx.slice(1) + '</b></td><td>' + val + "</td></tr>"
            }
        })
        $("#" + this.parentName).html(html + "</html>")
        return true
    }

    render = (parentName, node) => {
        this.parentName = parentName
        this.addListInfo(node)
    }

}

export default NodeListInfo

