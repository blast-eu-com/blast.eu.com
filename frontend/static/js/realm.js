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
var config = new FrontendConfig()
var account = new Account()

const Realm = class {

    constructor() {
        this._id = undefined
        this._name = undefined
        this._description = undefined
        this._accountEmail = undefined
        this._data = undefined
    }

    set id(id) { this._id = id }
    set name(name) { this._name = name }
    set description(description) { this._description = description }
    set accountEmail(accountEmail) { this._accountEmail = accountEmail }
    set rawData(rawData) { this._data = rawData }

    get id() { return this._id }
    get name() { return this._name }
    get description() { return this._description }
    get accountEmail() { return this._accountEmail }
    get rawData() { return this._data }

    add = async (realm) => {
        let url = config.proxyAPI + '/realms'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8"}
        let data = JSON.stringify({"realm": realm})
        let response = await fetch(url, {method: 'POST', headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    active = async (realm) => {
        let url = config.proxyAPI + '/realms/' + config.session.realm + '/active'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8" }
        let data = JSON.stringify({ "realm": realm })
        let response = await fetch(url, {method: 'PUT', headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    delete = async (realmName) => {
        let url = config.proxyAPI + '/realms/' + realmName
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'DELETE', headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    list = async () => {
        let url = config.proxyAPI + '/realms'
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'GET', headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    listByUniqName = async () => {
        let url = config.proxyAPI + '/realms/uniqs'
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'GET', headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    listByMember = async (member) => {
        let url = config.proxyAPI + '/realms/members/' + member
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'GET', headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    listByName = async (realmName) => {
        let url = config.proxyAPI + '/realms/' + realmName
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'GET', headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    listByMemberAndName = async (memberName, realmName) => {
        let url = config.proxyAPI + '/realms/' + realmName + '/members/' + memberName
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'GET', headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    load = (data) => {
        this.id = data["_id"]
        this.name = data["_source"]["name"]
        this.description = data["_source"]["description"]
        this.accountEmail = data["_source"]["account_email"]
        this.rawData = data["_source"]
    }

    role = async (realm) => {
        let url = config.proxyAPI + '/realms/' + realm["name"] + '/role'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8"}
        let data = JSON.stringify({ "realm": realm })
        let response = await fetch(url, {method: 'PUT', headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { account.logout() } else { return response }
        }
    }

    switchActive = (newRealm) => {
        let realm = {"name": newRealm, "member": config.session.accountEmail , "active": true}
        this.active(realm).then((switchRealmResult) => {
            if ( switchRealmResult["result"] == "updated" ) {
                account.cookies(config.session.accountEmail).then((setCookieResult) => {
                    if ( setCookieResult ) {
                        location.reload()
                    }
                })
            }
        })
    }

    switchRole = (realmName, memberName, role) => {
        let realm = {"name": realmName, "member": memberName, "role": role}
        this.role(realm).then((switchRoleResult) => {
            if ( switchRoleResult["result"] == "updated" ) {
                console.log("update OK")
            }
        })
    }
}

export default Realm
