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

const NodeListPeers = class {

    constructor() {
        this._pn
    }

    set parentName(pn) { this._pn = pn }

    get parentName() { return this._pn }

    addListPeers = async (node) => {
        let allNodesIp = []
        let html = `<table class="table"><thead><th><b>Peer ip</b></th><th><b>Action</th></thead>`
        let nodes = await node.list()

        nodes["hits"]["hits"].forEach(function(nodeData) {
            if ( typeof nodeData["_source"]["ip"] !== "object" ) {
                allNodesIp = allNodesIp.concat(nodeData["_source"]["ip"].split())
            } else { allNodesIp = allNodesIp.concat(nodeData["_source"]["ip"]) }
        })

        node.peers.sort().forEach((nodeIp) => {
            if ( allNodesIp.includes(nodeIp) ) {
                html = html + '<tr><td>' + nodeIp + '</td></tr>'
            } else {
                html = html + `<tr><td>` + nodeIp + `</td>
                    <td>
                    <div class="row">
                    <div class="col-5"><input class="col-5 form-control" id="nodeName" name="nodeName" type="text" placeholder="Node name"/></div>
                    <div class="col-5"><input class="col-5 form-control" maxlength="128" id="nodeDesc" name="nodeDesc" type="text" placeholder="Node description"/></div>
                    <div class="col-2"><button class="btn blast-btn">discover</button></div>
                    </div></td></tr>`
            }
        })

        $("#" + this.parentName).html(html + "</table>")
        return true
    }

    render = (parentName, node) => {
        this.parentName = parentName
        this.addListPeers(node)
    }

}

export default NodeListPeers