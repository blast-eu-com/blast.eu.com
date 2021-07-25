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

const ClusterListNodes = class {

    constructor() { }

    addListNodes = (cluster) => {
        let htmlTableHeader = '<table class="table">'
        let htmlTableCore = ''
        let htmlTableFooter = '</table>'
        if ( typeof cluster.nodes !== 'undefined' ) {
            cluster.nodes.forEach(function(nodeObj) {
                htmlTableCore = htmlTableCore + `
                <tr><td style="width: 16px">
                <img src="/img/object/node.svg" height="24" width="24" /></td>`
                $.each(nodeObj, function(idx, val) { htmlTableCore = htmlTableCore + '<td>' + val + '</td>' })
                htmlTableCore = htmlTableCore + '</tr>'
            })
        }
        $("#" + this.parentName).html(htmlTableHeader + htmlTableCore + htmlTableFooter)
    }

    render = (parentName, cluster) => {
        this.parentName = parentName
        this.addListNodes(cluster)
    }

}

export default ClusterListNodes