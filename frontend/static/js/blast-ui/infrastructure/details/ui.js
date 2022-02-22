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

import Infrastructure from '../../../infrastructure.js'
import InfrastructureListInfo from './listInfo.js'
import InfrastructureListClusters from './listClusters.js'
import InfrastructureManageClusters from './manageClusters.js'

var infrastructure = new Infrastructure()
var infrastructureListInfo = new InfrastructureListInfo()
var infrastructureListClusters = new InfrastructureListClusters()
var infrastructureManageClusters = new InfrastructureManageClusters()

const setButtonDeleteAction = function(infraId) {
    $('#btnDelInfra').on("click", function() {
        infrastructure.delete(infraId).then(function(resp) { location.href = "/html/infrastructure.html" })
    })
}

const setPageTitle = function(infraName) {
    $('#navInfraName').html(infraName)
}

async function main() {
    let urlParams = new URLSearchParams(window.location.href.split('?')[1])
    if ( urlParams.has("id") ) {
        let infraId = urlParams.get("id")
        let infraData = await infrastructure.listById(infraId)
        infrastructure.load(infraData["hits"]["hits"][0])
        setPageTitle(infrastructure.name)
        setButtonDeleteAction(infrastructure.id)
        infrastructureListInfo.render('infrastructureListInfo', infrastructure)
        infrastructureListClusters.render('infrastructureListClusters', infrastructure)
        infrastructureManageClusters.render('infrastructureManageClusters', infrastructure)
    }
}


window.main = main
window.addClusterToInfra = infrastructureManageClusters.addClusterToInfra
window.remClusterFromInfra = infrastructureManageClusters.remClusterFromInfra