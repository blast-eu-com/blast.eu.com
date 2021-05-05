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
// initialize the modal effect

// load the external objects
import Node from './node.js'
import Cluster from './cluster.js'
import Windower from './windower.js'
let node = new Node()
let cluster = new Cluster()
let windower = new Windower()


const setNodeDetailsTable = function(nodeDetails) {

    let html = `<img style="margin-left: 1rem; margin-bottom: 1rem" src="/img/object/node.svg" height="56" width="56" />
    <table class="table"><tr><td><b>Node id</b></td><td>` + nodeDetails["hits"]["hits"][0]["_id"] + `</td></tr>`
    $.each(nodeDetails["hits"]["hits"][0]["_source"], function(idx, val) {
        if ( idx === "ip" ) {
            html = html + '<tr><td><b>' + idx.charAt(0).toUpperCase() + idx.slice(1) + '</b></td><td>'
            val.sort().forEach(function(nodeIp){
                html = html + ' <span class="badge blast-badge">' + nodeIp + '</span>'
            })
        } else if ( idx !== "role" && idx !== "peers" ) {
            console.log("pass block b")
            html = html + '<tr><td><b>' + idx.charAt(0).toUpperCase() + idx.slice(1) + '</b></td><td>' + val + "</td></tr>"
        }
    })

    $("#nodeDetails").html(html + "</html>")
    return true
}

const setNodePeersTable = async function(nodeDetails) {

    let allNodesIp = []
    let html = `<table class="table"><thead><th><b>Peer ip</b></th><th><b>Action</th></thead>`
    let nodes = await node.list()

    nodes["hits"]["hits"].forEach(function(nodeData) {
        if ( typeof nodeData["_source"]["ip"] !== "object" ) {
            allNodesIp = allNodesIp.concat(nodeData["_source"]["ip"].split())
        } else { allNodesIp = allNodesIp.concat(nodeData["_source"]["ip"]) }
    })

    $.each(nodeDetails["hits"]["hits"][0]["_source"], function(idx, val) {
        if ( idx === "peers") {
            val.sort().forEach(function(nodeIp){
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
        }
    })

    $("#nodePeers").html(html + "</table>")
    return true
}

const setNodeRolesTable = function(nodeDetails) {

    //let html = '<table><thead><tr><th>port</th><th>protocol</th><th>application</th><th>description</th></tr></thead>'
    let html = '<table class="table">'
    nodeDetails["hits"]["hits"][0]["_source"]["role"].forEach(function(role) {
        html = html  + '<tr>'
        $.each(role, function(idx, val) { html = html + '<td>' + val + '</td>' })
        html = html + '</tr>'
    })

    $("#nodeRoles").html(html + "</table>")
    return true
}

const setPageTitle = function(nodeName) {
   $('#navNodeName').html(nodeName)
}


const setButtonDeleteAction = function(nodeId) {
    $('#btnDelNode').on("click", function() {
        node.delete(nodeId).then(function(nodeDeleteResp) {
            if ( nodeDeleteResp["result"] === "deleted" ) { location.reload() }
        })
    })
}

const setButtonRescanAction = function(nodeId) {
    $("#btnRescanNode").on("click", function() {
        node.rescan(nodeId).then(function(nodeRescan) {
            if (nodeRescan["result"] === "updated") {
                location.reload()
            }
        })
    })
}

const loadNodeDetails = async function() {

    // collect url params passed via HTTP GET method
    let urlParams = new URLSearchParams(window.location.href.split('?')[1])

    // confirm the node_id param is present and collect the current node_id
    if ( urlParams.has("node_id") ) {
        let nodeId = urlParams.get("node_id")
        let nodeName = urlParams.get("node_name")

        setPageTitle(nodeName)
        setButtonDeleteAction(nodeId)
        setButtonRescanAction(nodeId)

        let nodeDetails = await node.listByIds([nodeId])
        console.log(nodeDetails)
        if ( nodeDetails["hits"]["total"]["value"] == 1 ) {
            setNodeDetailsTable(nodeDetails)
            setNodePeersTable(nodeDetails)
            setNodeRolesTable(nodeDetails)

            let allClusterList = await cluster.list()
            let allClusterByNodeId = await cluster.listByNodeIds([nodeId])
            loadClusterMembership(allClusterList, allClusterByNodeId)
        }
    }
}

const reScan = function(nodeId) {
    console.log("rescan function")
}

window.loadNodeDetails = loadNodeDetails
window.reScan = reScan
