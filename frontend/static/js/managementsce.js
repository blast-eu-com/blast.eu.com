/*
 *   Copyright 2020 Jerome DE LUCCHI
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
*/

// import the config with global variables
import FrontendConfig from './frontend.js'
let config = new FrontendConfig()
const rampartUrl = config.proxyURL + '/api/' + config.frontend.version


let Managementsce = class {

    constructor() {
        this.ident = undefined
        this.scr = undefined
        this.mri = undefined
        this.mrd = undefined
        this.mrn = undefined
    }

    get script() { return this.scr }
    get id() { return this.ident }
    get management_run_id() { return this.mri }
    get management_run_description() { return this.mrd }
    get management_run_node() { return this.mrn }

    set script(scr) { this.scr = scr }
    set id(idt) { this.ident = idt }
    set management_run_id(mri) { this.mri = mri }
    set management_run_description(mrd) { this.mrd = mrd }
    set management_run_node(mrn) { this.mrn = mrn }

    add = function(formData) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realm/' + config.session.realm + '/management/scenario',
                type: "POST",
                headers: {"Authorization": config.session.httpToken},
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(formData),
                success: function(Resp) {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logoutAccount()
                        } else { resolve(Resp) }
                }
            })
        })
    }

    list = function() {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realm/' + config.session.realm + '/management/scenario',
                type: "GET",
                headers: {"Authorization": config.session.httpToken},
                success: function(Resp) {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logoutAccount()
                        } else { resolve(Resp) }
                }
            })
        })
    }

    listById = function(id) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realm/' + config.session.realm + '/management/scenario/' + id,
                type: "GET",
                headers: {"Authorization": config.session.httpToken},
                success: function(Resp) {
                    if(typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logoutAccount()
                        } else { resolve(Resp) }
                }
            })
        })
    }
}



export default Managementsce

