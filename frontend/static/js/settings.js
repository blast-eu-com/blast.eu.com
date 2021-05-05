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
let config = new FrontendConfig()

const Setting = class {

    constructor() { }

    list = function() {

        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/settings',
                type: "GET",
                headers: {"Authorization": config.session.httpToken},
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if ( "tokenExpired" in Resp ) { account.logoutAccount() }
                    else if ( "failure" in Resp ) { console.log( Resp["failure"] ) }
                    else { resolve(Resp) }
                }
            })
        })
    }

    save = function(formData) {

        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/settings/' + config.session.settingId,
                type: "PUT",
                headers: {"Authorization": config.session.httpToken},
                data: JSON.stringify(formData),
                contentType: "Application/JSON; charset=utf-8",
                dataType: "json",
                success: function(Resp) {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if ( "tokenExpired" in Resp ) { account.logoutAccount() }
                    else if ( "failure" in Resp ) { console.log( Resp["failure"] ) }
                    else { resolve(Resp) }
                }
            })
        })
    }
}

export default Setting