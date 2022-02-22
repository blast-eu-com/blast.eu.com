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
var config = new FrontendConfig()

let Scheduler = class {

    constructor() {

        this._id = undefined
        this._name = undefined
        this._description = undefined
        this._scenarios = undefined
        this._daily = undefined
        this._status = undefined
        this._time = undefined
        this._interval = undefined
        this._realm = undefined
        this._data = undefined
    }

    set id(id) { this._id = id }
    set name(name) { this._name = name }
    set description(description) { this._description = description }
    set scenarios(scenarios) { this._scenarios = scenarios }
    set daily(daily) { this._daily = daily }
    set status(status) { this._status = status }
    set time(time) { this._time = time }
    set interval(interval) { this._interval = interval }
    set realm(realm) { this._realm = realm }
    set rawData(data) { this._data = data}

    get id() { return this._id }
    get name() { return this._name }
    get description() { return this._description }
    get scenarios() { return this._scenarios }
    get daily() { return this._daily }
    get time() { return this._time }
    get interval() { return this._interval }
    get realm() { return this._realm }
    get rawData() { return this._data}

    add = async (formData) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/schedulers'
        let header = { 'Authorization': config.session.httpToken }
        let data = JSON.stringify(formData)
        let response = await fetch(url, {method: "POST", headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    list = async () => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/schedulers'
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: "GET", headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    listById = async (schedulerId) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/schedulers/' + schedulerId
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: "GET", headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    action = async (scheduler_data) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/schedulers/action'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8"}
        let data = JSON.stringify(scheduler_data)
        let response = await fetch(url, {method: "POST", headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    load = (schedulerData) => {
        this.id = schedulerData["_id"]
        this.name = schedulerData["_source"]["name"]
        this.description = schedulerData["_source"]["description"]
        this.scenarios = schedulerData["_source"]["scenarios"]
        this.daily = schedulerData["_source"]["daily"]
        this.status = schedulerData["_source"]["status"]
        this.time = schedulerData["_source"]["time"]
        this.interval = schedulerData["_source"]["interval"]
        this.realm = schedulerData["_source"]["realm"]
        this.rawData = schedulerData["_source"]
    }
}

export default Scheduler