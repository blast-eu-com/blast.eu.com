/*
 *   Copyright 2020 Jerome DE LUCCHI
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
*/

import Managementsce from './managementsce.js'
let managementsce = new Managementsce()

const setPageTitle = function(managementsceName) {
    $('#navManagementsceName').html(managementsceName)
}

const setButtonDeleteAction = function(managementsce_id) {
    $('#btnDelManagementsce').on("click", async function() {
        let managementsceDeleteResp = await managementsce.delete(managementsce_id)
        if ( managementsceDeleteResp["result"] === "deleted" ) { location.href = "/html/scheduler.html" }
    })
}

const setManagementsceDetailsTable = function(managementsceDetails) {
    console.log(managementsceDetails)
    let html = `<img style="margin-left: 1rem" src="/img/object/management.svg" width="56" height="56" />
    <table class="table mt-2"><thead></thead><tr><td><b>Management scenario id</b></td><td>` + managementsceDetails["_id"] + `</td></tr>`
    $.each(managementsceDetails["_source"], function(idx, val) {
        html = html + '<tr><td><b>' + idx.charAt(0).toUpperCase() + idx.slice(1) + '</b></td><td>' + val + '</td></tr>'
    })
    return html + '</table>'
}

const loadManagementsceDetails = async function() {
    let urlParams = new URLSearchParams(window.location.href.split('?')[1])
    if ( urlParams.has("managementsce_id") ) {
        managementsce.id = urlParams.get("managementsce_id")
        managementsce.management_run_id = urlParams.get("management_run_id")

        setPageTitle(managementsce.management_run_id)
        setButtonDeleteAction(managementsce.id)

        let managementsceDetails = await managementsce.listById(managementsce.id)
        if ( managementsceDetails["hits"]["total"]["value"] === 1 ) {
            $("#managementsceDetails").html(setManagementsceDetailsTable(managementsceDetails["hits"]["hits"][0]))
        }
    }
}





window.loadManagementsceDetails = loadManagementsceDetails