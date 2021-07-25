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
import Account from './aaa.js'

var account = new Account()
var config = new FrontendConfig()

export function listAgg(report) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: config.proxyAPI + '/realms/' + config.session.realm + '/reports/agg',
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

export function listScroll(report) {
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

export function filterScroll(report) {
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

export function filterScrollData(report_type, scroll_id) {
   return new Promise((resolve, reject) => {
        $.ajax({
            url: config.proxyAPI + '/realms/' + config.session.realm + '/reports/filter/scroll/data?report_type=' + report_type + '&_scroll_id=' + scroll_id,
            type: "GET",
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