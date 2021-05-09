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

var account = new Account()
var config = new FrontendConfig()

const Reporter = class {

    constructor() {

        this._interval = undefined
        this._intervalUnit = undefined
        this._intervalStart = undefined
        this._intervalEnd = undefined
        this._search = undefined
        this._searchObject = undefined
        this._searchField = undefined
        this._searchString = undefined

    }

    set interval(interval) { this._interval = interval }
    set intervalUnit(unit) { this._intervalUnit = unit }
    set intervalStart(intervalStart) { this._intervalStart = intervalStart }
    set intervalEnd(intervalEnd) { this._intervalEnd = intervalEnd }
    set search(search) { this._search = search }
    set searchObject(object) { this._searchObject = object }
    set searchField(field) { this._searchField = field }
    set searchString(string) { this._searchString = string }

    get interval() { return this._interval }
    get intervalUnit() { return this._intervalUnit }
    get intervalStart() { return this._intervalStart }
    get intervalEnd() { return this._intervalEnd }
    get search() { return this._search }
    get searchObject() { return this._searchObject }
    get searchField() { return this._searchField }
    get searchString() { return this._searchString }

    list_scroll = (report) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/reports/list/scroll',
                type: "POST",
                data: JSON.stringify({"report": report}),
                headers: {'Authorization': config.session.httpToken},
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: (Resp) => {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) {
                        account.logout()
                    } else { resolve(Resp) }
                }
            })
        })
    }

    filter_scroll = (report) => {
       return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/reports/filter/scroll',
                type: "POST",
                data: JSON.stringify({"report": report}),
                headers: {'Authorization': config.session.httpToken},
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: (Resp) => {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) {
                        account.logout()
                    } else { resolve(Resp) }
                }
            })
       })
    }

    filter_scroll_data = (scroll_id) => {
       return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/reports/filter/scroll/data',
                type: "GET",
                data: {"_scroll_id": scroll_id},
                headers: {'Authorization': config.session.httpToken},
                success: (Resp) => {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) {
                        account.logout()
                    } else { resolve(Resp) }
                }
            })
       })
    }
}

export default Reporter