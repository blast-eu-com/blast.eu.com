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

import Node from '../../../node.js'
import NodeListInfo from  './listInfo.js'
import NodeListPeers from './listPeers.js'
import NodeListRoles from './listRoles.js'
import ManageMode from './manageMode.js'

var node = new Node()
var nodeListInfo = new NodeListInfo()
var nodeListPeers = new NodeListPeers()
var nodeListRoles = new NodeListRoles()
var manageMode = new ManageMode()

const setButtonDeleteAction = (nodeId) => {
    $('#btnDelNode').on("click", function() {
        node.delete(nodeId).then(function(nodeDeleteResp) {
            if ( nodeDeleteResp["result"] === "deleted" ) { location.reload() }
        })
    })
}

const setButtonRescanAction = (nodeId) => {
    $("#btnRescanNode").on("click", function() {
        node.rescan(nodeId).then(function(nodeRescan) {
            if (nodeRescan["result"] === "updated") { location.reload() }
        })
    })
}

const setPageTitle = (nodeName) => {
    $("#navNodeName").html(nodeName)
}

async function main() {

    let urlParams = new URLSearchParams(window.location.href.split('?')[1])
    if ( urlParams.has("id") ) {
        let nodeId = urlParams.get("id")
        let nodeData = await node.listById(nodeId)
        node.load(nodeData["hits"]["hits"][0])
        setPageTitle(node.name)
        setButtonDeleteAction(nodeId)
        setButtonRescanAction(nodeId)
        nodeListInfo.render('nodeDetails', node)
        nodeListPeers.render('nodePeers', node)
        nodeListRoles.render('nodeRoles', node)
        manageMode.render('nodeMode', node)
    }

}

window.main = main
window.updateNodeMode = manageMode.updateNodeMode