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

import Node from '../../node.js'
var node = new Node()

const NodeForm = class {

    constructor() {

        this._name = undefined
        this._ip = undefined
        this._description = undefined
        this._fd = undefined

        this.frame = `
            <form>
                <div class="row mb-3">
                    <div id="nodeNameContainer" class="col-md-6"></div>
                    <div id="nodeIPContainer" class="col-md-6"></div>
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
    }

    set formData(fd) { this._fd = fd }
    set name(nodeName) { this._name = nodeName }
    set ip(nodeIp) { this._ip = nodeIp }
    set description(nodeDescription) { this._description = nodeDescription }

    get formData() { return this._fd }
    get name() { this._name }
    get ip() { this._ip }
    get description() { this._description }

    setFormData = () => {
        this.formData = {
            "name": $("#nodeName").val(),
            "ip": $("#nodeIp").val(),
            "description": $("#nodeDesc").val(),
            "scan_by_ip": $("#nodeScanByIp").is(":checked") ? true : false,
            // "container": $("#nodeContainer").is(":checked") ? true : false,
        }
    }

    addForm = () => {
        $("#nodeNameContainer").html(this.inputNodeName)
        $("#nodeIPContainer").html(this.inputNodeIP)
        $("#nodeDescriptionContainer").html(this.inputNodeDescription)
        $("#nodeScanByIpContainer").html(this.inputNodeScanByIp)
        // $("#nodeContainer").html(this.inputNodeContainer)
    }

    addFrame = (parentName) => {
        $("#" + parentName).html(this.frame)
    }

    addNode = () => {
        this.setFormData()
        node.add([this.formData]).then(function(R) {
            for ( let idx in R ) {
                if (R[idx]["result"] === "created") {
                    let nodeMsg = `Node ` + nodeData["name"] + ` successfully created.`
                    // windower.displayToastMsg(nodeMsg)
                    loadNodeList()
                }
            }
        })
    }

    render = (parentName) => {
        this.parentName = parentName
        this.addFrame(this.parentName)
        this.addForm()
    }

}

export default NodeForm