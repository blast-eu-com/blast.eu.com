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

import Node from '../../../node.js'

var node = new Node()

const ScenarioNodesTree = class {

    constructor(parentName) {
        this.parentName = parentName
    }

    runNodes = () => {
        let nodeList = []
        $.ui.fancytree.getTree("#" + this.parentName).getSelectedNodes().forEach((node) => {
            if ( node.type === 'node' && ! nodeList.includes(node.title)) { nodeList.push(node.title) }
        })
        return nodeList
    }

    runNodesId = async () => {
        let nodesId = []
        let nodesData = await node.listByNames(this.runNodes())
        for ( let i=0; i<nodesData["hits"]["hits"].length; i++ ) { nodesId.push(nodesData["hits"]["hits"][i]["_id"]) }
        return nodesId
    }

    addNodeTree = (scenario) => {
        scenario.loadTreeSource().then((data) => {
            $("#" + this.parentName).fancytree({
                "selectMode": 3,
                "checkbox": true,
                "source": data,
                /*
                "select": function (event, data) {
                    scenario.runNodes()
                    //sce.rolesSelectedNodes()
                }
                */
            })
        })
    }

    render = (scenario) => {
        this.addNodeTree(scenario)
    }

}

export default ScenarioNodesTree