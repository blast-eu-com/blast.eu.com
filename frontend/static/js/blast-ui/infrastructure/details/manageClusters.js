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

import Cluster from '../../../cluster.js'
import Infrastructure from '../../../infrastructure.js'

var cluster = new Cluster()
var infrastructure = new Infrastructure()

const InfrastructureManageClusters = class {

    constructor() {
        this.frame = `
            <div class="row">
            <div id="selectAddClustersContainer" class="col-md-6"></div>
            <div id="selectRemClustersContainer" class="col-md-6"></div>
            </div>
        `
    }

    addFrame() {
        $("#" + this.parentName).html(this.frame)
    }

    setInfraManageAddClusters = async (infrastructure) => {
        let infraClusters = []
        let allCluster = await cluster.list()
        let htmlSelectHeader = `
            <div class="input-group mb-3">
            <select name="select_infra_clu_add" class="form-select"><option value="" disabled selected>clu to add</option>
        `
        let htmlSelectCore = ``
        let htmlSelectFooter = `</select>
            <button id="btnAddCluster" class="btn blast-btn" onclick="addClusterToInfra()">add</button>
            </div>
        `
        infrastructure.clusters.forEach(function(cluObj) { infraClusters.push(cluObj["name"]) })

        if ( allCluster["hits"]["total"]["value"] > 0 ) {
            allCluster["hits"]["hits"].forEach(function(cluObj) {
                if ( !infraClusters.includes(cluObj["_source"]["name"] )) {
                    htmlSelectCore = htmlSelectCore + `<option value="` + cluObj["_id"] + `">` + cluObj["_source"]["name"] + `</option>`
                }
            })
        }
        $("#selectAddClustersContainer").html(htmlSelectHeader + htmlSelectCore + htmlSelectFooter)
    }

    addClusterToInfra = () => {
        let clusterId = $('select[name=select_infra_clu_add] option:selected').val()
        let clusterName = $('select[name=select_infra_clu_add] option:selected').text()
        let infraClusterData = {"id": clusterId, "name": clusterName}
        infrastructure.add_cluster(this.infrastructure_id, [infraClusterData]).then(function(resp) { location.reload() })
    }

    setInfraManageRemClusters = (infrastructure) => {
        let htmlSelectHeader = `
            <div class="input-group">
            <select name="select_infra_clu_rem" class="form-select"><option value="" disabled selected>clu to rem</option>
        `
        let htmlSelectCore = ``
        let htmlSelectFooter = `
            </select>
            <button id="btnRemCluster" class="btn blast-btn" onclick="remClusterFromInfra()">remove</a>
            </div>
        `
        infrastructure.clusters.forEach(function(cluObj) { htmlSelectCore = htmlSelectCore + '<option value="' + cluObj["id"] + '">' + cluObj["name"] + '</option>' })
        $("#selectRemClustersContainer").html(htmlSelectHeader + htmlSelectCore + htmlSelectFooter)

    }

    remClusterFromInfra = () => {
        let clusterId = $('select[name=select_infra_clu_rem] option:selected').val()
        infrastructure.delete_cluster(this.infrastructure_id, [clusterId]).then(function(resp) { location.reload() })
    }

    render(parentName, infrastructure) {
        this.parentName = parentName
        this.infrastructure_id = infrastructure.id
        this.addFrame()
        this.setInfraManageAddClusters(infrastructure)
        this.setInfraManageRemClusters(infrastructure)
    }

}

export default InfrastructureManageClusters