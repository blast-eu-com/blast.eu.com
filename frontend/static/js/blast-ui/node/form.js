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
        this._nn
        this._ni
        this._nd
        this._nd
        this._ns
        this._fd

        this.frame = `
            <form>
                <div class="row mb-3">
                    <div id="nodeNameContainer" class="col-md-4"></div>
                    <div id="nodeIPContainer" class="col-md-4"></div>
                    <div id="nodeClusterContainer" class="col-md-4"></div>
                </div>
                <div class="row mb-3">
                    <div id="nodeDescriptionContainer" class="col-md-12"></div>
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

        this.inputNodeCluster = ``
        cluster.list(config.session.realm).then((clusters) => {
            if (clusters["hits"]["total"]["value"] > 0) {
                this.inputNodeCluster = this.inputNodeCluster + `
                    <label for="selectNodeCluster" class="form-label">Node cluster</label>
                    <select class="form-select" name="selectNodeCluster" id="selectNodeCluster">
                `
                clusters["hits"]["hits"].forEach((cluster) => {
                    this.inputNodeCluster = this.inputNodeCluster + `<option value="` + cluster["_id"] + `">` + cluster["_source"]["name"] + `</option>`
                })
                this.inputNodeCluster = this.inputNodeCluster + `</select><div class="form-text">Select the parent cluster for this node.</div>`
            }
        })

    }

    set formData(fd) { this._fd = fd }
    set name(nodeName) { this._nn = nodeName }
    set ip(nodeIp) { this._ni = nodeIp }
    set description(nodeDescription) { this._nd = nodeDescription }
    set cluster(nodeCluster) { this._nc = nodeCluster }
    set scan(nodeScan) { this._ns = nodeScan }

    get formData() { return this._fd }
    get name() { return this._nn }
    get ip() { return this._ni }
    get description() { return this._nd }
    get cluster() { return this._nc }
    get scan() { return this._ns}

    setFormData = () => {
        this.name = $("#nodeName").val()
        this.ip = $("#nodeIp").val()
        this.description = $("#nodeDesc").val()
        this.scan = $("#nodeScanByIp").is(":checked") ? true : false
        this.cluster = $("#selectNodeCluster").length ? $('select[name="selectNodeCluster"] option:selected').val() : ''
        this.formData = {
            "name": this.name,
            "ip": this.ip,
            "description": this.description,
            "scan_by_ip": this.scan,
            "cluster": this.cluster
            // "container": $("#nodeContainer").is(":checked") ? true : false,
        }
    }

    addForm = () => {
        $("#nodeNameContainer").html(this.inputNodeName)
        $("#nodeIPContainer").html(this.inputNodeIP)
        $("#nodeDescriptionContainer").html(this.inputNodeDescription)
        $("#nodeScanByIpContainer").html(this.inputNodeScanByIp)
        $("#nodeClusterContainer").html(this.inputNodeCluster)
        // $("#nodeContainer").html(this.inputNodeContainer)
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