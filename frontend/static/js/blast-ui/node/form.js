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

import Node from '../../node.js'
import Cluster from '../../cluster.js'
import {nodeType} from '../../node-type.js'
import {nodeOsType} from '../../node-os-type.js'
import {nodeMode} from '../../node-mode.js'
import FrontendConfig from '../../frontend.js'
import Toast from '../main/notification/toast.js'
import {dictionary} from '../main/message/en/dictionary.js'
var node = new Node()
var cluster = new Cluster()
var config = new FrontendConfig()
var toast = new Toast()
toast.msgPicture = '../../../img/object/node.svg'

const NodeForm = class {

    constructor(parentName) {

        this.parentName = parentName
        this._fd

        this.frame = `
            <form>
                <div class="row mb-3">
                    <div id="nodeNameContainer" class="col-md-4"></div>
                    <div id="nodeIPContainer" class="col-md-4"></div>
                    <div id="nodeClusterContainer" class="col-md-4"></div>
                </div>
                <div class="row mb-3">
                    <div id="nodeDescriptionContainer" class="col-md-6"></div>
                    <div id="nodeTypeContainer" class="col-md-3"></div>
                    <div id="nodeOsTypeContainer" class="col-md-3"></div>
                </div>
                <div class="row mb-3">
                    <div id="nodeScanByIpContainer" class="col-md-6"></div>
                    <!-- <div id="nodeContainer" class="col-md-6"></div> -->
                </div>
            </form>
        `

        this.inputNodeName = `
            <label for="nodeName" class="form-label">Node Hostname.</label>
            <input id="nodeName" type="text" name="nodeName" class="form-control" />
            <div id="nodeNameHelp" class="form-text">Set the node hostname.</div>
        `
        this.inputNodeIP = `
            <label for="nodeIp" class="form-label">Node IP.</label>
            <input id="nodeIp" type="text" name="nodeIp" class="form-control" />
            <div id="nodeIPHelp" class="form-text">Set the node IP.</div>
        `
        this.inputNodeDescription = `
            <label for="nodeDesc" class="form-label">Node Description.</label>
            <input id="nodeDesc" type="text" name="nodeDesc" class="form-control" />
            <div id="nodeDescHelp" class="form-text">Describe the node in a few words.</div>
        `
        this.inputNodeScanByIp = `
            <input type="checkbox" id="nodeScanByIp" name="nodeScanByIp" /> Scan node by IP
            <div id="nodeScanByIpHelp" class="form-text">Check if the node scan must use the node IP, default is node hostname.</div>
        `
        this.inputNodeContainer = `
            <input type="checkbox" id="nodeContainer" name="nodeContainer" /> Node docker
            <div id="nodeContainerHelp" class="form-text">Check if the node is a container.</div>
        `
        this.inputNodeType = ``
        nodeType().then((ntypes) => {
            if (ntypes["hits"]["total"]["value"] > 0) {
                this.inputNodeType = this.inputNodeType + `
                    <label for="selectNodeType" class="form-label">Node type</label>
                    <select class="form-select" name="selectNodeType" id="selectNodeType">
                `
                ntypes["hits"]["hits"].forEach((ntype) => {
                    this.inputNodeType = this.inputNodeType + `<option value="` + ntype["_source"]["name"] + `">` + ntype["_source"]["name"] + `</option>`
                })
                this.inputNodeType = this.inputNodeType + `</select><div class="form-text">Select the type of this node.</div>`
            }
        })

        this.inputNodeOsType = ``
        nodeOsType().then((nOsTypes) => {
            if (nOsTypes["hits"]["total"]["value"] > 0) {
                this.inputNodeOsType = this.inputNodeOsType + `
                    <label for="selectNodeOsType" class="form-label">Node OS type</label>
                    <select class="form-select" name="selectNodeOsType" id="selectNodeOsType">
                `
                nOsTypes["hits"]["hits"].forEach((nOsType) =>{
                    this.inputNodeOsType = this.inputNodeOsType + `<option value="` + nOsType["_source"]["name"] + `">` + nOsType["_source"]["name"] + `</option>`
                })
                this.inputNodeOsType = this.inputNodeOsType + `</select><div class="form-text">Select the OS of this node.</div>`
            }
        })

        this.inputNodeCluster = ``
        cluster.list().then((clusters) => {
            if (clusters["hits"]["total"]["value"] > 0) {
                this.inputNodeCluster = this.inputNodeCluster + `
                    <label for="selectNodeCluster" class="form-label">Node cluster</label>
                    <select class="form-select" name="selectNodeCluster" id="selectNodeCluster">
                `
                clusters["hits"]["hits"].forEach((clu) => {
                    this.inputNodeCluster = this.inputNodeCluster + `<option value="` + clu["_source"]["name"] + `">` + clu["_source"]["name"] + `</option>`
                })
                this.inputNodeCluster = this.inputNodeCluster + `</select><div class="form-text">Select the parent cluster for this node.</div>`
            }
        })

    }

    set formData(fd) { this._fd = fd }

    get formData() { return this._fd }

    setFormData = () => {
        this.formData = {
            "name": $("#nodeName").val(),
            "ip": $("#nodeIp").val(),
            "description": $("#nodeDesc").val(),
            "scan_by_ip": $("#nodeScanByIp").is(":checked") ? true : false,
            "cluster": $("#selectNodeCluster").length ? $('select[name="selectNodeCluster"] option:selected').val() : '',
            "type": $('select[name="selectNodeType"] option:selected').val(),
            "os": {
                "type": $('select[name="selectNodeOsType"] option:selected').val()
            }
        }
    }

    addForm = () => {
        $("#nodeNameContainer").html(this.inputNodeName)
        $("#nodeIPContainer").html(this.inputNodeIP)
        $("#nodeDescriptionContainer").html(this.inputNodeDescription)
        $("#nodeScanByIpContainer").html(this.inputNodeScanByIp)
        $("#nodeClusterContainer").html(this.inputNodeCluster)
        $("#nodeTypeContainer").html(this.inputNodeType)
        $("#nodeOsTypeContainer").html(this.inputNodeOsType)
    }

    addFrame = () => {
        $("#" + this.parentName).html(this.frame)
    }

    addNode = () => {
        this.setFormData()
        let actionRes, nodeData = this.formData
        node.add(nodeData).then((Resp) => {
            if (Resp["result"] === "created") {
                toast.msgTitle = "Node create Success"
                toast.msgText = dictionary["node"]["add"].replace('%nodeName%', nodeData["name"])
                actionRes = "success"
            } else if ( Object.keys(Resp).includes("failure") ) {
                toast.msgTitle = "Node create Failure"
                toast.msgText = Resp["failure"]
                actionRes = "failure"
            }
            toast.notify(actionRes)
            setTimeout(() => { location.reload() }, 2000)
        })
    }

    render = () => {
        this.addFrame()
        this.addForm()
    }

}

export default NodeForm