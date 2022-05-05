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
    add = async (portMapData) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/portmaps'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8" }
        let data = JSON.stringify(portMapData)
        let response = await fetch(url, {method: "POST", headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    update = async (portMapId, portMapData) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/portmaps/' + portMapId
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8" }
        let data = JSON.stringify(portMapData)
        let response = await fetch(url, {method: "PUT", headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    delete = async (portMapId) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/portmaps/' + portMapId
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

    listByName = async (portMapName) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/portmaps/names/' + portMapName
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: "GET", headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    listByPort = async (portMapPort) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/portmaps/ports/' + portMapPort
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: "GET", headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    listByProto = async (portMapProto) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/portmaps/protos/' + portMapProto
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: "GET", headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    listByPortAndProto = async (portMapPort, portMapProto) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/portmaps/ports/' + portMapPort + '/protos/' + portMapProto
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: "GET", headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

}

export default PortMap
