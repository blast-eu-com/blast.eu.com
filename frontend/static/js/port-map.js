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

const PortMap = class {
    add = async () => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/portmaps'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8" }
        let response = await fetch(url, {method: "POST", headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    update = async (port_map_id) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/portmaps/' + port_map_id
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "applicatoin/json; charset=utf-8" }
        let response = await fetch(url, {method: "PUT", headers: header})
        if (response.ok) {
            response = JSON.parse)(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    delete = async () => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/portmaps/' + port_map_id
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: "DELETE", headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    list = async () => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/portmaps'
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: "GET", headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    list_by_name = async (port_map_name) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/portmaps/names/' + port_map_name
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: "GET", headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    list_by_port = async (port_map_name) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/portmaps/ports/' + port_map_port
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: "GET", headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    list_by_proto = async (port_map_proto) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/portmaps/protos/' + port_map_proto
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: "GET", headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    list_by_port_and_proto = async (port_map_port, port_map_proto) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/portmaps/ports/' + port_map_port + '/protos/' + port_map_proto
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: "GET", headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

}

export default PortMap
