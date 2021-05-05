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

import Cluster from '../../../../cluster.js'
import Node from '../../../../node.js'

var cluster = new Cluster()
var node = new Node()

const ClusterManageNodes = class {

    constructor() {

        this.frame = `
            <div class="row">
            <div id="selectAddNodesContainer" class="col-md-6"></div>
            <div id="selectRemNodesContainer" class="col-md-6"></div>
            </div>
        `
    }

    addNodeToCluster = () => {
        let nodeId = $('select[name=select_cluster_node_add] option:selected').val()
        let nodeName = $('select[name=select_cluster_node_add] option:selected').text()
        let ClusterNodeData = {"id": nodeId, "name": nodeName }
        cluster.add_node(this.cluster_id, [ClusterNodeData]).then(function(resp) { location.reload() })
    }

    setClusterManageAddNodes = async (cluster) => {
        let clusterNodes = []
        let allNode = await node.list()
        let htmlSelectHeader = `
        <div class="input-group">
        <select name="select_cluster_node_add" class="form-select"><option value="" disabled selected>node to add</option>`
        let htmlSelectCore = ``
        let htmlSelectFooter = `</select>
        <button id="btnAddNode" class="btn blast-btn" onclick="addNodeToCluster()"><b>Add</b></button></div>`
        cluster.nodes.forEach(function(nodeObj) { clusterNodes.push(nodeObj["name"]) })

        if ( allNode["hits"]["total"]["value"] > 0 ) {
            allNode["hits"]["hits"].forEach(function(nodeObj) {
                if ( !clusterNodes.includes(nodeObj["_source"]["name"] )) {
                    htmlSelectCore = htmlSelectCore + '<option value="' + nodeObj["_id"] + '">' + nodeObj["_source"]["name"] + '</option>'
                }
            })
        }
        $("#selectAddNodesContainer").html(htmlSelectHeader + htmlSelectCore + htmlSelectFooter)
    }

    setClusterManageRemNodes = (cluster) => {
        let htmlSelectHeader = `
        <div class="input-group">
        <select name="select_cluster_node_rem" class="form-select"><option value="" disabled selected>node to rem</option>`
        let htmlSelectCore = ``
        let htmlSelectFooter = `
            </select>
            <button id="btnRemNode" class="btn blast-btn" onclick="remNodeFromCluster()"><b>Remove</b></button>
            </div>`
        cluster.nodes.forEach(function(nodeObj) { htmlSelectCore = htmlSelectCore + '<option value="' + nodeObj["id"] + '">' + nodeObj["name"] + '</option>' })
        $("#selectRemNodesContainer").html(htmlSelectHeader + htmlSelectCore + htmlSelectFooter)
    }

    remNodeFromCluster = () => {
        let nodeId = $('select[name=select_cluster_node_rem] option:selected').val()
        cluster.delete_node(this.cluster_id, [nodeId]).then(function(resp) { location.reload() })
    }

    addFrame = () => {
        $("#" + this.parentName).html(this.frame)
    }

    render = (parentName, cluster) => {
        this.parentName = parentName
        this.cluster_id = cluster.id
        this.addFrame()
        this.setClusterManageAddNodes(cluster)
        this.setClusterManageRemNodes(cluster)

    }
}

export default ClusterManageNodes