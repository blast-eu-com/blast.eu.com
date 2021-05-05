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
import Cluster from './cluster.js'
import Node from './node.js'
import FrontendConfig from './frontend.js'
import Windower from './windower.js'
let clu = new Cluster()
let node = new Node()
let config = new FrontendConfig()
let windower = new Windower()

const addNodeToCluster = function() {
    let nodeId = $('select[name=select_cluster_node_add] option:selected').val()
    let nodeName = $('select[name=select_cluster_node_add] option:selected').text()
    let ClusterNodeData = {"id": nodeId, "name": nodeName, "account_email": config.session.accountEmail }
    clu.add_node(clu.cluId, ClusterNodeData).then(function(resp) {
        if (resp["result"] == "updated") {
            location.reload()
        }
    })
}

const removeNodeFromCluster = function() {
    let nodeId = $('select[name=select_cluster_node_rem] option:selected').val()
    clu.delete_node(clu.cluId, nodeId).then(function(resp) {
        if (resp["result"] == "updated") {
            location.reload()
        }
    })
}

const setButtonDeleteAction = function() {
    $('#btnDelCluster').on("click", function() {
        clu.delete(clu.cluId).then(function(Resp) {
            if (Resp["result"] === "deleted") {
                location.href = "/html/cluster.html"
            }
        })
    })
}

const setPageTitle = function() {
    $('#navClusterName').html(clu.cluName)
}

const setClusterDetailsTable = function() {
    let htmlTableHeader = `<img style="margin-left: 1rem; margin-bottom: 1rem" src="/img/object/cluster.svg" height="56" width="56" />
    <table class="table"><thead></thead><tr><td><b>Cluster id</b></td><td>` + clu.cluId + `</td></tr>`
    let htmlTableCore = ''
    let htmlTableFooter = '</table>'
    $.each(clu.cluRawData, function(idx, val) {
        if ( idx !== "node" ) { htmlTableCore = htmlTableCore + '<tr><td><b>' + idx.charAt(0).toUpperCase() + idx.slice(1) + '</b></td><td>' + val + '</td></tr>' }
    })
    return htmlTableHeader + htmlTableCore + htmlTableFooter
}

const setClusterNodesTable = function() {
    let htmlTableHeader = '<table class="table">'
    let htmlTableCore = ''
    let htmlTableFooter = '</table>'
    clu.cluNode.forEach(function(nodeObj) {
        htmlTableCore = htmlTableCore + `<tr><td style="width: 16px">            
            <img src="/img/object/node.svg" height="24" width="24" /></td>`
        $.each(nodeObj, function(idx, val) { htmlTableCore = htmlTableCore + '<td>' + val + '</td>' })
        htmlTableCore = htmlTableCore + '</tr>'
    })
    console.log(htmlTableHeader + htmlTableCore + htmlTableFooter)
    return htmlTableHeader + htmlTableCore + htmlTableFooter
}

const setClusterManageAddNode = async function(cluId, cluData) {
    let clusterNodes = []
    let allNode = await node.list()
    let htmlSelectHeader = `<div class="input-group mb-3">
    <select name="select_cluster_node_add" class="custom-select"><option value="" disabled selected>node to add</option>`
    let htmlSelectCore = ``
    let htmlSelectFooter = `</select>
    <div class="input-group-append">
    <button id="btnAddNode" class="btn blast-btn" onclick="addNodeToCluster('` + cluId + `')"><b>Add</b></button>
    </div></div>`
    cluData["node"].forEach(function(nodeObj) { clusterNodes.push(nodeObj["name"]) })

    if ( allNode["hits"]["total"]["value"] > 0 ) {
        allNode["hits"]["hits"].forEach(function(nodeObj) {
            if ( !clusterNodes.includes(nodeObj["_source"]["name"] )) {
                htmlSelectCore = htmlSelectCore + '<option value="' + nodeObj["_id"] + '">' + nodeObj["_source"]["name"] + '</option>'
            }
        })
    }
    console.log(htmlSelectHeader + htmlSelectCore + htmlSelectFooter)
    return htmlSelectHeader + htmlSelectCore + htmlSelectFooter
}

const setClusterManageRemNode = function() {
    let htmlSelectHeader = `<div class="input-group">
    <select name="select_cluster_node_rem" class="custom-select"><option value="" disabled selected>node to rem</option>`
    let htmlSelectCore = ``
    let htmlSelectFooter = `</select>
    <div class="input-group-append">
    <a id="btnRemNode" class="btn blast-btn" onclick="removeNodeFromCluster('` + clu.cluId + `')"><b>Remove</b></a>
    </div></div>`
    clu.cluNode.forEach(function(nodeObj) { htmlSelectCore = htmlSelectCore + '<option value="' + nodeObj["id"] + '">' + nodeObj["name"] + '</option>' })
    return htmlSelectHeader + htmlSelectCore + htmlSelectFooter
}

const setClusterManage = function() {
    setClusterManageAddNode(clu.cluId, clu.cluRawData).then(function(clusterManageAddNode) {
        let html = `<div class="row">
        <div class="col-md-6">` + clusterManageAddNode + `</div>
        <div class="col-md-6">` + setClusterManageRemNode(clu.cluId, clu.cluRawData) + `</div>
        </div>`
        console.log(html)
        $("#clusterManage").html(html)
    })
}

const loadCluster = function(cluId) {
    return new Promise(function(resolve, reject) {
        clu.listById(cluId).then(function(cluData) {
            if ( cluData["found"] ) {
                clu.load(cluData)
                resolve(true)
            }
        })
    })
}

const loadClusterDetails = function() {
    let urlParams = new URLSearchParams(window.location.href.split('?')[1])
    if ( urlParams.has("cluster_id") ) {
        let cluId = urlParams.get("cluster_id")
        loadCluster(cluId).then(function(res){
            setPageTitle()
            setButtonDeleteAction()
            $("#clusterDetails").html(setClusterDetailsTable())
            $("#clusterNodes").html(setClusterNodesTable())
            setClusterManage()
        })
    }
}

window.loadClusterDetails = loadClusterDetails
window.removeNodeFromCluster = removeNodeFromCluster
window.addNodeToCluster = addNodeToCluster
