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

import Cluster from '../../../cluster.js'
import Node from '../../../node.js'
import Toast from '../../main/notification/toast.js'
import {dictionary} from '../../main/message/en/dictionary.js'
var cluster = new Cluster()
var node = new Node()
var toast = new Toast()
toast.msgPicture = '../../../img/object/cluster.svg'


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
        let actionRes
        cluster.add_node(this.clusterId, {"id": nodeId, "name": nodeName}).then((Resp) => {
            if ( Resp["result"] === 'updated' ) {
                toast.msgTitle = "Cluster add node Success"
                toast.msgText = dictionary["cluster"]["addNode"].replace('%nodeName%', nodeName)
                actionRes = "success"
            } else if (Object.keys(Resp).includes("failure")) {
                toast.msgTitle = "Cluster add node Failure"
                toast.msgText = Resp["failure"]
                actionRes = "failure"
            }
            toast.notify(actionRes)
            setTimeout(() => { location.reload() }, 2000 )
        })
    }

    setClusterManageAddNodes = async (cluster) => {
        let clusterNodes = []
        let allNode = await node.list()
        let html = `<div class="input-group"><select id="select_cluster_node_add" name="select_cluster_node_add" class="form-select">
            <option value="" disabled selected>node to add</option></select>
            <button id="btnAddNode" class="btn blast-btn" onclick="addNodeToCluster()">Add</button></div>`
        $("#selectAddNodesContainer").html(html)
        let select = document.getElementById("select_cluster_node_add")
        cluster.nodes.forEach(function(nodeObj) { clusterNodes.push(nodeObj["name"]) })

        allNode["hits"]["hits"].forEach(function(nodeObj) {
            if ( !clusterNodes.includes(nodeObj["_source"]["name"] )) {
                let option = document.createElement("option")
                let optionContent = document.createTextNode(nodeObj["_source"]["name"])
                option.setAttribute("value", nodeObj["_id"])
                option.appendChild(optionContent)
                select.appendChild(option)
            }
        })
    }

    setClusterManageRemNodes = (cluster) => {
        let html = `<div class="input-group"><select id="select_cluster_node_rem" name="select_cluster_node_rem" class="form-select">
            <option value="" disabled selected>node to rem</option></select>
            <button id="btnRemNode" class="btn blast-btn" onclick="remNodeFromCluster()">Remove</button></div>`
        $("#selectRemNodesContainer").html(html)
        let select = document.getElementById("select_cluster_node_rem")
        cluster.nodes.forEach(function(nodeObj) {
            let option = document.createElement("option")
            let optionContent = document.createTextNode(nodeObj["name"])
            option.setAttribute("value", nodeObj["name"])
            option.appendChild(optionContent)
            select.appendChild(option)
        })
    }

    remNodeFromCluster = () => {
        let nodeName = $('select[name=select_cluster_node_rem] option:selected').val()
        let actionRes
        cluster.delete_node(this.clusterId, nodeName).then((Resp) => {
            if ( Resp["result"] === 'updated' ) {
                toast.msgTitle = "Cluster delete node Success"
                toast.msgText = dictionary["cluster"]["deleteNode"].replace('%nodeName%', nodeName)
                actionRes = "success"
            } else if ( Object.keys(Resp).includes("failure") ) {
                 toast.msgTitle = "Cluster delete node Failure"
                 toast.msgText = Resp["failure"]
                 actionRes = "failure"
            }
            toast.notify(actionRes)
            setTimeout(() => { location.reload() }, 2000)
        })
    }

    addFrame = () => {
        $("#" + this.parentName).html(this.frame)
    }

    render = (parentName, cluster) => {
        this.parentName = parentName
        this.clusterId = cluster.id
        this.addFrame()
        this.setClusterManageAddNodes(cluster)
        this.setClusterManageRemNodes(cluster)

    }
}

export default ClusterManageNodes