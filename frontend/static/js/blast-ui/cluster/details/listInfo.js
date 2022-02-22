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

const ClusterListInfo = class {

    constructor() { }

    addListInfo = (cluster) => {
        let htmlTableHeader = `
            <img style="margin-left: 1rem; margin-bottom: 1rem" src="/img/object/cluster.svg" height="56" width="56" />
            <table class="table">
                <thead></thead>
                <tr><td><b>Cluster id</b></td><td>` + cluster.id + `</td></tr>`
        let htmlTableCore = ''
        let htmlTableFooter = '</table>'

        $.each(cluster.rawData, function(idx, val) {
            if ( idx !== "nodes" ) { htmlTableCore = htmlTableCore + '<tr><td><b>' + idx.charAt(0).toUpperCase() + idx.slice(1) + '</b></td><td>' + val + '</td></tr>' }
        })
        $("#" + this.parentName).html(htmlTableHeader + htmlTableCore + htmlTableFooter)
    }

    render = (parentName, cluster) => {
        this.parentName = parentName
        this.addListInfo(cluster)
    }
}

export default ClusterListInfo
