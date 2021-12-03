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

import nodeMode from '../../../nodemode.js'

const ManageMode = class {

    constructor() {
        this._pn
        this._node
    }

    get parentName() { return this._pn }
    get node() { return this._node }

    set parentName(pn) { this._pn = pn }
    set node(nd) { this._node = nd }

    addManageMode = () => {
        let html = `<div class="input-group"><select id="select_node_mode" name="select_node_mode" class="form-select">
        </select><button class="btn blast-btn" onclick="updateNodeMode('` + this.node["_id"] + `')">switch</button></div>`
        $("#" + this.parentName).html(html)
        let select = document.getElementById("select_node_mode")
        nodeMode().then((modes) => {
            modes["hits"]["hits"].forEach((mode) => {
                if ( mode["_source"]["name"] !== this.node.mode ) {
                    let option = document.createElement("option")
                    let optionContent = document.createTextNode(mode["_source"]["name"])
                    option.setAttribute("value", mode["_source"]["name"])
                    option.appendChild(optionContent)
                    select.appendChild(option)
                }
            })
        })
    }

    updateNodeMode = (nodeId) => {
        this.node.rawData["mode"] = $('select[name=select_node_mode] option:selected').val()
        this.node.update(nodeId, this.node.rawData).then((updateRes) => {
            if ( Object.keys(updateRes).includes("result") && updateRes["result"] === "updated" ) { location.reload() }
        })
    }

    render = (parentName, node) => {
        this.parentName = parentName
        this.node = node
        this.addManageMode()
    }
}

export default ManageMode