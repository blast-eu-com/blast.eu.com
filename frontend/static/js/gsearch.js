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

export function GSearch(data) {
    return new Promise(function(resolve, reject) {
        $.ajax({
            url: config.proxyAPI + '/realms/' + config.session.realm + '/global/filter',
            type: "GET",
            data: {"string": data},
            headers: {'Authorization': config.session.httpToken},
            success: function(Resp) {
                if ( typeof Resp === "string" ) { Resp = JSON.parse(Resp) }
                if ( Object.keys(Resp).includes("tokenExpired")) { account.logoutAccount()
                    } else { resolve(Resp) }
            }
        })
    })
}

export function GSearchScrollId(scrollId) {
     return new Promise(function(resolve, reject) {
        $.ajax({
            url: config.proxyAPI + '/realms/' + config.session.realm + '/global/filter/scroll',
            type: "GET",
            data: {"_scroll_id": scrollId},
            headers: {'Authorization': config.session.httpToken},
            success: function(Resp) {
                if ( typeof Resp === "string" ) { Resp = JSON.parse(Resp) }
                if ( Object.keys(Resp).includes("tokenExpired")) { account.logoutAccount()
                    } else { resolve(Resp) }
            }
        })
    })
}