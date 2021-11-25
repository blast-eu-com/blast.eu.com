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

import Infrastructure from '../../../infrastructure.js'
import Cluster from '../../../cluster.js'
import Toast from '../../main/notification/toast.js'
import {dictionary} from '../../main/message/en/dictionary.js'
var infrastructure = new Infrastructure()
var cluster = new Cluster()
var toast = new Toast()
toast.msgPicture = '../../../../img/object/infrastructure.svg'


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
        let actionRes, displayTime
        infrastructure.add_cluster(this.infrastructure_id, infraClusterData).then(function(Resp) {
            if ( Resp["result"] === "updated" ) {
                toast.msgTitle = "Infrastructure add cluster Success"
                toast.msgText = dictionary["infrastructure"]["addCluster"].replace('%clusterName%', clusterName)
                actionRes = "success"
                displayTime = 2000
            } else if ( Object.keys(Resp).includes("failure") ) {
                toast.msgTitle = "Infra add cluster Failure"
                toast.msgText = Resp["failure"]
                actionRes = "failure"
                displayTime = 5000
            }

            toast.notify(actionRes)
            setTimeout(() => { location.reload() }, 2000)
        })
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
        infrastructure.clusters.forEach(function(cluObj) { htmlSelectCore = htmlSelectCore + '<option value="' + cluObj["name"] + '">' + cluObj["name"] + '</option>' })
        $("#selectRemClustersContainer").html(htmlSelectHeader + htmlSelectCore + htmlSelectFooter)

    }

    remClusterFromInfra = () => {
        let clusterName = $('select[name=select_infra_clu_rem] option:selected').val()
        let actionRes, displayTime
        infrastructure.delete_cluster(this.infrastructure_id, clusterName).then(function(Resp) {
            if ( Resp["result"] === "updated" ) {
                toast.msgTitle = "Infra remove cluster Success"
                toast.msgText = dictionary["infrastructure"]["removeCluster"].replace('%clusterName%', clusterName)
                actionRes = "success"
                displayTime = 2000
            } else if ( Object.keys(Resp).includes("failure") ) {
                toast.msgTitle = "Infrastructure remove cluster Failure"
                toast.msgText = Resp["failure"]
                actionRes = "failure"
                displayTime = 5000
            }

            toast.notify(actionRes)
            setTimeout(() => { location.reload() }, displayTime )
        })
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