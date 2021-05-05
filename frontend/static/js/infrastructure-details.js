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
import Infrastructure from './infrastructure.js'
import Cluster from './cluster.js'
import FrontendConfig from './frontend.js'
import Windower from './windower.js'
let infra = new Infrastructure()
let cluster = new Cluster()
let config = new FrontendConfig()
let windower = new Windower()

const addClusterToInfra = function() {
    let clusterId = $('select[name=select_infra_clu_add] option:selected').val()
    let clusterName = $('select[name=select_infra_clu_add] option:selected').text()
    let infraClusterData = {"id": clusterId, "name": clusterName, "account_email": config.session.accountEmail}
    infra.add_cluster(infra.id, infraClusterData).then(function(resp) {
        if ( resp["result"] == "updated" ) { location.reload() }
    })
}

const remClusterFromInfra = async function() {
    let clusterId = $('select[name=select_infra_clu_rem] option:selected').val()
    let infraClusterDeleteResp = infra.delete_cluster(infra.id, clusterId)
    if ( infraClusterDeletedResp["result"] == "updated" ) { location.reload() }
}

const setButtonDeleteAction = function(infraId) {
    $('#btnDelInfra').on("click", async function() {
        let infraDeleteResp = await infra.delete(infraId)
        if ( infraDeleteResp["result"] === "deleted" ) {
            location.href = "/html/infrastructure.html"
        }
    })
}

const setInfraDetailsTable = function(InfraDetails) {
    let html = `<img style="margin-left: 1rem" src="/img/object/infrastructure.svg" width="56" height="56" />
    <table class="table"><thead></thead><tr><td><b>Infrastructure id</b></td><td>` + InfraDetails["_id"] + `</td></tr>`
    $.each(InfraDetails["_source"], function(idx, val) {
        if ( idx !== "cluster" ) { html = html + '<tr><td><b>' + idx.charAt(0).toUpperCase() + idx.slice(1) + '</b></td><td>' + val + '</td></tr>' }
    })
    return html + '</table>'
}

const setInfraClustersTable = function(infraDetails) {
    let htmlTableHeader = '<table class="table">'
    let htmlTableCore = ''
    let htmlTableFooter = '</table>'
    let clusterListSorted = infraDetails['_source']['cluster'].sort(function(objA, objB) {
        if ( objA.name < objB.name ) { return -1 }
        if ( objA.name > objB.name ) { return 1 }
        return 0
    })
    clusterListSorted.forEach(function(clusterObj) {
        htmlTableCore = htmlTableCore + `<tr><td style="width: 16px">
            <img src="/img/object/cluster.svg" height="24" width="24" /></td>`
        $.each(clusterObj, function(idx, val) { htmlTableCore = htmlTableCore + '<td>' + val + '</td>' })
        htmlTableCore = htmlTableCore + '</tr>'
    })
    return htmlTableHeader + htmlTableCore + htmlTableFooter
}

const setPageTitle = function(infraName) {
    $('#navInfraName').html(infraName)
}

const setInfraManageAddCluster = async function(infraId, infraData) {
    let infraClusters = []
    let allCluster = await cluster.list()
    let htmlSelectHeader = `<div class="input-group mb-3">
    <select name="select_infra_clu_add" class="custom-select"><option value="" disabled selected>clu to add</option>`
    let htmlSelectCore = ``
    let htmlSelectFooter = `</select>
    <div class="input-group-append">
    <button id="btnAddCluster" class="btn blast-btn" onclick="addClusterToInfra('` + infraId + `')">add</button>\`
    </div></div>`

    infraData["cluster"].forEach(function(cluObj) { infraClusters.push(cluObj["name"]) })

    if ( allCluster["hits"]["total"]["value"] > 0 ) {
        allCluster["hits"]["hits"].forEach(function(cluObj) {
            if ( !infraClusters.includes(cluObj["_source"]["name"] )) {
                htmlSelectCore = htmlSelectCore + `<option value="` + cluObj["_id"] + `">` + cluObj["_source"]["name"] + `</option>`
            }
        })
    }

    return htmlSelectHeader + htmlSelectCore + htmlSelectFooter
}

const setInfraManageRemCluster = function(infraId, infraData) {
    let htmlSelectHeader = `<div class="input-group">
    <select name="select_infra_clu_rem" class="custom-select"><option value="" disabled selected>clu to rem</option>`
    let htmlSelectCore = ``
    let htmlSelectFooter = `</select>
    <div class="input-group-append">
    <button id="btnRemCluster" class="btn blast-btn" onclick="remClusterFromInfra('` + infraId + `')">remove</a>
    </div></div>`
    infraData["cluster"].forEach(function(cluObj) { htmlSelectCore = htmlSelectCore + '<option value="' + cluObj["id"] + '">' + cluObj["name"] + '</option>' })
    return htmlSelectHeader + htmlSelectCore + htmlSelectFooter

}

const setInfraManage = function(infraDetails) {
    let infraId = infraDetails["_id"]
    let infraData = infraDetails["_source"]
    setInfraManageAddCluster(infraId, infraData)
        .then(function(infraManageAddCluster) {
            let html = `<div class="row">
            <div class="col-md-6">` + infraManageAddCluster + `</div>
            <div class="col-md-6">` + setInfraManageRemCluster(infraId, infraData) + `</div>
            </div>`
            $("#infraManage").html(html)
        })
}

const loadInfrastructureDetails = async function() {
    let urlParams = new URLSearchParams(window.location.href.split('?')[1])
    if ( urlParams.has("infrastructure_id") ) {
        infra.id = urlParams.get("infrastructure_id")
        infra.name = urlParams.get("infrastructure_name")

        setPageTitle(infra.name)
        setButtonDeleteAction(infra.id)

        let infraDetails = await infra.listById(infra.id)
        console.log(infraDetails)
        if ( infraDetails["found"] ) {

            $("#infraDetails").html(setInfraDetailsTable(infraDetails))
            $("#infraClusters").html(setInfraClustersTable(infraDetails))
            setInfraManage(infraDetails)
        }
    }
}

window.loadInfrastructureDetails = loadInfrastructureDetails
window.addClusterToInfra = addClusterToInfra
window.remClusterFromInfra = remClusterFromInfra