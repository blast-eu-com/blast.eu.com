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

import FrontendConfig from './frontend.js'
let config = new FrontendConfig()

let Management = class {

    constructor() {

        this.managementStartAt = undefined
        this.managementEndAt = undefined


        // all related to management session display
        this.sampleIntervalPicker = 24
        this.sampleIntervalCounter = 1
        this.samplePerPage = 5
        this.samplePageNum = 1
        this.samplePageMax = 1
    }

    set ManagementSampleIntervalPicker(SIP) { this.sampleIntervalPicker = SIP }
    set ManagementSampleIntervalCounter(SIC) { this.sampleIntervalCounter = SIC }
    set ManagementSamplePerPage(SPP) { this.samplePerPage = SPP }
    set ManagementSamplePageNum(SPN) { this.samplePageNum = SPN }
    set ManagementSamplePageMax(SPM) { this.samplePageMax = SPM }

    get ManagementSampleIntervalPicker() { return this.sampleIntervalPicker }
    get ManagementSampleIntervalCounter() { return this.sampleIntervalCounter }
    get ManagementSamplePerPage() { return this.samplePerPage }
    get ManagementSamplePageNum() { return this.samplePageNum }
    get ManagementSamplePageMax() { return this.samplePageMax }

    list = function() {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realm/' + config.session.realm + '/management',
                type: "GET",
                headers: {"Authorization": config.session.httpToken},
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if ( "tokenExpired" in Resp ) { account.logoutAccount()
                        } else { resolve(Resp) }
                }
            })
        })
    }

    listSessByTimeRange = function(delta) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realm/' + config.session.realm + '/management/time/' + delta,
                type: "GET",
                headers: {"Authorization": config.session.httpToken},
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if ( "tokenExpired" in Resp ) { account.logoutAccount()
                        } else { resolve(Resp) }
                }
            })
        })
    }

    listSessByTimeAndPageRange = function(delta, docStart, docEnd) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realm/' + config.session.realm + '/management/time/' + delta + '/doc/start/' + docStart + '/end/' + docEnd,
                type: "GET",
                headers: {"Authorization": config.session.httpToken},
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if ( "tokenExpired" in Resp ) { account.logoutAccount()
                        } else { resolve(Resp) }
                }
            })
        })
    }

    countSessByTimeRange = function(delta) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realm/' + config.session.realm + '/management/time/' + delta + '/count',
                type: "GET",
                headers: {"Authorization": config.session.httpToken},
                success: function(Resp) {
                    console.log(Resp)
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if ( "tokenExpired" in Resp ) { account.logoutAccount()
                        } else { resolve(Resp) }
                }
            })
        })
    }

}


/* update the display session management window of the management page
 * define interval picker
 * define num of item per page
 * filter management run id
 */
const loadManagementSessionUIHeader = function() {
    windower.managementSessionWindow("managementSessionFrame")
}

const loadManagementSessionUICore = function() {
    let interval = $("select#selSampleIntervalPicker option:selected").val()
    let count = $("select#selSampleIntervalCounter option:selected").val()
    let perPage = $("select#managementSessionselSamplePerPage option:selected").val()
    sce.ManagementSampleIntervalPicker = interval
    sce.ManagementSampleIntervalCounter = count
    sce.ManagementSamplePerPage = perPage

    sce.listSessByTimeRange(sce.ManagementSampleIntervalPicker * sce.ManagementSampleIntervalCounter).then(function(managementSessionData) {
        windower.managementSessionWindowCoreData(sce.ManagementSamplePerPage, managementSessionData["hits"]["hits"])
    })
}


const loadManagementSessionUI = async function() {
    loadManagementSessionUIHeader()
    loadManagementSessionUICore()
}

const managementSessionDisplay = function() {
    loadManagementSessionUICore()
}


export default Management