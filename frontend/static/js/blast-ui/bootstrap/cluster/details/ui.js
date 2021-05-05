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

import Cluster from '../../../../cluster.js'
import ClusterListInfo from './listInfo.js'
import ClusterListNodes from './listNodes.js'
import ClusterManageNodes from './manageNodes.js'

var cluster = new Cluster()
var clusterListInfo = new ClusterListInfo()
var clusterListNodes = new ClusterListNodes()
var clusterManageNodes = new ClusterManageNodes()

const setButtonDeleteAction = function(clusterId) {
    $('#btnDelCluster').on("click", function() {
        cluster.delete([clusterId]).then(function(Resp) { location.href = "/html/cluster.html" })
    })
}

const setPageTitle = function(clusterName) {
    $('#navClusterName').html(clusterName)
}

async function main() {
    let urlParams = new URLSearchParams(window.location.href.split('?')[1])
    if (urlParams.has("cluster_id")) {
        let clusterId = urlParams.get("cluster_id")
        let clusterData = await cluster.listByIds([clusterId])
        cluster.load(clusterData["hits"]["hits"][0])
        setPageTitle(cluster.name)
        setButtonDeleteAction(cluster.id)
        clusterListInfo.render('clusterListInfo', cluster)
        clusterListNodes.render('clusterListNodes', cluster)
        clusterManageNodes.render('clusterManageNodes', cluster)
    }
}

window.main = main
window.addNodeToCluster = clusterManageNodes.addNodeToCluster
window.remNodeFromCluster = clusterManageNodes.remNodeFromCluster