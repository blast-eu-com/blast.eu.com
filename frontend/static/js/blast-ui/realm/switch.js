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

import FrontendConfig from '../../frontend.js'
import Realm from '../../realm.js'

var config = new FrontendConfig()
var realm = new Realm()

const RealmSwitch = class {

    constructor() { }

    addSwitch = () => {
        let html = `
            <div class="input-group">
            <select name="realm_to_switch" class="form-select">
        `
        realm.listByMember(config.session.accountEmail).then((realms) => {
            realms["hits"]["hits"].forEach((realmDetails) => {
                if ( ! realmDetails["_source"]["active"] ) {
                    html = html + '<option value="' + realmDetails["_source"]["name"] + '">' + realmDetails["_source"]["name"] + '</option>'
                }
            })
            html = html + `
                </select>
                <button id="btnSwitchRealm" class="btn blast-btn" onclick="realmSwitchRealm()">switch</button>
                <div>
            `
            $("#" + this.parentName).html(html)
        })
    }

    switchRealm = () => {
        let newRealm = $('select[name="realm_to_switch"]').val()
        realm.switchActive(newRealm)
    }

    render = (parentName) => {
        this.parentName = parentName
        this.addSwitch()
    }
}

export default RealmSwitch