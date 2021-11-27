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


const InfrastructureListClusters = class {

    constructor() { }

    addListClusters = (infrastructure) => {
        let htmlTableHeader = '<table class="table">'
        let htmlTableCore = ''
        let htmlTableFooter = '</table>'
        let clusterListSorted = infrastructure.clusters.sort(function(objA, objB) {
            if ( objA.name < objB.name ) { return -1 }
            if ( objA.name > objB.name ) { return 1 }
            return 0
        })
        clusterListSorted.forEach(function(clusterObj) {
            htmlTableCore = htmlTableCore + `<tr><td style="width: 16px">
                <img src="/img/object/cluster.svg" height="24" width="24" /></td>`
            $.each(clusterObj, function(idx, val) {
                if ( idx === "id" ) {
                    htmlTableCore = htmlTableCore + '<td><a href="/html/cluster-details.html?id=' + val + '"><span class="badge blast-badge">' + val + '</span></a></td>'
                } else {
                   htmlTableCore = htmlTableCore + '<td>' + val + '</td>'
                }
            })
            htmlTableCore = htmlTableCore + '</tr>'
        })
        $("#" + this.parentName).html(htmlTableHeader + htmlTableCore + htmlTableFooter)
    }

    render(parentName, infrastructure) {
        this.parentName = parentName
        this.addListClusters(infrastructure)


    }
}

export default InfrastructureListClusters