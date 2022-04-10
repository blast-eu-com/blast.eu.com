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
var node = new Node()

var NodeList = class {

    constructor(parentName) {
        this.parentName = parentName
        this.frame = `
            <div id="simpleWindowFrameCore" class="mt-2"></div>
            <div id="simpleWindowInteractive" class="row p-1 m-1"></div>
        `
        this.msgNodeNotFound = `<div class="p-5" style="text-align: center;">
        <img src="/img/object/node.svg" width="92" height="92"><b><h3 class="mt-3">NODE NOT FOUND</h3></b>
        Add a node from this page\'s form to see it appearing into this list.</div>`
    }

    addFrame = () => {
        $('#' + this.parentName).html(this.frame)
    }

    templateNode(nodeData) {
        let html = `<div class="row mb-2">`
        let colNum = 0
        nodeData.forEach((nod) => {
            if (colNum === 6) {
                html = html + `</div><div class="row mb-2">`
                colNum = 0
            }
            html = html + `
                <div class="col-sm-2">
                    <a id="node-img"class="card bg-gradient rounded h-100 border-0"
                        href="/html/node-details.html?id=` + nod["_id"] + `&node_name=` + nod["_source"]["name"] + `">
                        <img src="/img/hexa_blue_background.jpg" style="opacity: 0.9;">
                        <img src="/img/object/node.svg" class="card-img-top mt-3 py-3" height="92" width="92" style="position: absolute"/>
                        <div class="card-body text-dark text-center" style="position: absolute; top: 42.5%; width: 100%">
                            <div class="card-title" style="font-size: 16px">` + nod["_source"]["name"] + `</div>
                            <span style="font-size: 12px">` + nod["_source"]["description"] + `</span><br>
                        </div>
                        <div class="card-footer bg-gradient text-center text-dark p-0 border-0" style="background-color: #FFE873">
                            <span class="fw-lighter" style="font-size: 12px;">` + nod["_id"] + `</span>
                        </div>
                    </a>
                </div>
            `
            colNum += 1
        })
        return html
    }

    loadNode = () => {
        node.list().then((nodeData) => {
            $("#simpleWindowInteractive").pagination({
                dataSource: nodeData["hits"]["hits"],
                pageSize: 60,
                callback: (data, pagination) => {
                    let html = this.templateNode(data)
                    $("#simpleWindowFrameCore").html(html)
                }
            })
        })
    }

    render = () => {
        this.addFrame()
        this.loadNode()
    }
}


export default NodeList
