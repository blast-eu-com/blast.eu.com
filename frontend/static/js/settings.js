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
let config = new FrontendConfig()

const Setting = class {

    constructor() { }

    list = async () => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/settings'
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'GET', headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    save = async (data) => {
        let formData = new FormData()
        formData.append("ansible_username", data["ansible"]["username"])
        formData.append("ansible_password", data["ansible"]["password"])
        formData.append("ansible_certificate", data["ansible"]["certificate"])
        formData.append("ansible_inventory_location", data["ansible"]["inventory"]["location"])
        formData.append("ssh_username", data["ssh"]["username"])
        formData.append("ssh_password", data["ssh"]["password"])
        formData.append("ssh_certificate", data["ssh"]["certificate"])
        formData.append("ssh_location", data["ssh"]["location"])
        data = formData
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/settings/' + config.session.settingId
        let header = { 'Authorization': config.session.httpToken}
        let response = await fetch(url, {method: 'PUT', headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }
}

export default Setting