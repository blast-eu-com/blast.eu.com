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

import FrontendConfig from './frontend.js'
import Account from './account.js'

var config = new FrontendConfig()
var account = new Account()

export async function GSearch(gsearch_data) {
    let url = config.proxyAPI + '/realms/' + config.session.realm + '/global/filter/' + gsearch_data
    let header = {'Authorization': config.session.httpToken}
    let response = await fetch(url, {method: "GET", headers: header})
    if (response.ok) {
        response = JSON.parse(await response.text())
        if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
    }
}

export async function GSearchScrollId(scrollId) {
    let url = config.proxyAPI + '/realms/' + config.session.realm + '/global/filter/scroll/' + scrollId
    let header = { 'Authorization': config.session.httpToken }
    let response = await fetch(url, {method: "GET", headers: header})
    if (response.ok) {
        response = JSON.parse(await response.text())
        if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
    }
}