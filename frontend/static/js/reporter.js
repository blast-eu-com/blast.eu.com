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

import FrontendConfig from './frontend.js'
import Account from './account.js'

var account = new Account()
var config = new FrontendConfig()

export async function listAgg(report) {
    let url = config.proxyAPI + '/realms/' + config.session.realm + '/reports/agg'
    let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8" }
    let data = JSON.stringify({"report": report})
    let response = await fetch(url, {method: "POST", headers: header, body: data})
    if (response.ok) {
        response = JSON.parse(await response.text())
        if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
    }
}

export async function listScroll(report) {
    let url = config.proxyAPI + '/realms/' + config.session.realm + '/reports/list/scroll'
    let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8" }
    let data = JSON.stringify({"report": report})
    let response = await fetch(url, {method: "POST", headers: header, body: data})
    if (response.ok) {
        response = JSON.parse(await response.text())
        if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
    }
}

export async function filterScroll(report) {
    let url = config.proxyAPI + '/realms/' + config.session.realm + '/reports/filter/scroll'
    let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8" }
    let data = JSON.stringify({"report": report})
    let response = await fetch(url, {method: "POST", headers: header, body: data})
    if (response.ok) {
        response = JSON.parse(await response.text())
        if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
    }
}

export async function filterScrollData(report_type, scroll_id) {
    let url = config.proxyAPI + '/realms/' + config.session.realm + '/reports/filter/scroll/data?report_type=' + report_type + '&_scroll_id=' + scroll_id
    let header = { 'Authorization': config.session.httpToken }
    let response = await fetch(url, {method: "GET", headers: header})
    if (response.ok) {
        response = JSON.parse(await response.text())
        if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
    }
}