/*
   Copyright 2020 Jerome DE LUCCHI

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
import Account from './aaa.js'

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

    add = function(realms) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms',
                type: "POST",
                headers: {'Authorization': config.session.httpToken},
                data: JSON.stringify({"realms": realms}),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) {
                        Resp = JSON.parse(Resp)
                        if (Object.keys(Resp).includes("tokenExpired")) {
                            account.logout()
                        } else if (Object.keys(Resp).includes("failure")) {
                            console.log("failure")
                        }
                    } else if ( typeof Resp === 'object') {
                        resolve(Resp)
                    }
                }
            })
        })
    }

    delete = function(realmIds) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms',
                type: "DELETE",
                headers: {'Authorization': config.session.httpToken},
                data: JSON.stringify({"realm_ids": realmIds}),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) {
                        Resp = JSON.parse(Resp)
                        if (Object.keys(Resp).includes("tokenExpired")) {
                            account.logout()
                        } else if (Object.keys(Resp).includes("failure")) {
                            console.log("failure")
                        }
                    } else if ( typeof Resp === 'object') {
                        resolve(Resp)
                    }
                }
            })
       })
    }

    list = function() {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms',
                type: "GET",
                headers: {'Authorization': config.session.httpToken},
                success: function(Resp) {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) {
                        account.logout()
                    } else { resolve(Resp) }
                }
            })
        })
    }

    listByIds = function(realmIds) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/ids',
                type: "GET",
                data: {"ids": realmIds},
                headers: {'Authorization': config.session.httpToken},
                success: function(Resp) {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) {
                        account.logout()
                    } else { resolve(Resp) }
                }
            })
        })
    }

    load = (data) => {
        this.id = data["_id"]
        this.name = data["_source"]["name"]
        this.description = data["_source"]["description"]
        this.accountEmail = data["_source"]["account_email"]
        this.rawData = data["_source"]
    }

    switch = (newRealm) => {
        account.activateRealm(newRealm).then((switchRealmResult) => {
            if ( switchRealmResult["result"] == "updated" ) {
                account.cookies(config.session.accountEmail).then((setCookieResult) => {
                    if ( setCookieResult ) {
                        location.href = "/html/home.html"
                    }
                })
            }
        })
    }
}

export default Realm
