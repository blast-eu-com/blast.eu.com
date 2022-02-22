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

import Realm from '../../../realm.js'
import FrontendConfig from '../../../frontend.js'

var realm = new Realm()
var config = new FrontendConfig()

const RealmListMembers = class {

    constructor() {
        this._pn
        this._role
    }

    static set parentName(pn) { this._pn = pn }
    static set role(role) { this._role = role }

    static get parentName() { return this._pn }
    static get role() { return this._role }

    addListMembers = (realm) => {
        let html = '<ul style="padding-left: 0;">'
        realm.listByName(realm.name).then((realms) => {
            realms["hits"]["hits"].forEach((record) => {
                html = html + this.addMemberRow(realm, this.role, record)
            })
            $("#" + this.parentName).html(html + '</ul>')
        })
    }

    addMemberRow = (realm, role, record) => {
        let html = ''
        if (record["_source"]["member"] !== config.session.accountEmail) {
            html = `<li style="padding: 1%; border-bottom: thin solid #C1C1C1;"><div class="dropdown" style="display: inline-block">`
            if (this.role === 'owner') {
                html = html + `
                    <img src="/img/bootstrap-icons-1.0.0-alpha5/three-dots.svg" class="dropdown-toggle" id="` + record["_id"] + `" data-bs-toggle="dropdown" aria-expanded="false" />
                    <ul class="dropdown-menu" aria-labelledby="` + record["_id"] + `">
                        <li><button class="dropdown-item" type="button" onclick="switchMemberRole('` + realm.name + `', '` + record["_source"]["member"] + `', 'delegate') ;">Delegate</button></li>
                        <li><button class="dropdown-item" type="button" onclick="switchMemberRole('` + realm.name + `', '` + record["_source"]["member"] + `', 'owner') ;">Owner</button></li>
                        <li><button class="dropdown-item" type="button" onclick="switchMemberRole('` + realm.name + `', '` + record["_source"]["member"] + `', 'regular') ;">Regular</button></li>
                        <li class="dropdown-divider"></li>
                        <li><button class="dropdown-item" type="button" onclick="">Remove</button></li>
                    </ul>`
            }

            html = html + `
                </div>
                <div style="display: inline-block; margin-left: 5%;">` + record["_source"]["member"] + `</div>
                <div style="display: inline-block; margin-right: 5%; float: right;">` + record["_source"]["role"] + `</div>
            </li>`
        }
        return html
    }

    render = async (parentName, realm) => {
        this.role = await realm.listByMemberAndName(config.session.accountEmail, realm.name)
        this.role = this.role["hits"]["hits"][0]["_source"]["role"]
        this.parentName = parentName
        this.addListMembers(realm)
    }
}

export default RealmListMembers