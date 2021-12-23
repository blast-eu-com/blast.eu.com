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

import Account from '../../../aaa.js'
import FrontendConfig from '../../../frontend.js'

var account = new Account()
var config = new FrontendConfig()

const RealmListMembers = class {

    constructor() { }

    addListMembers = (realm) => {
        let html = '<table class="table">'
        account.listByRealm(realm.name).then((accounts) => {
            accounts["hits"]["hits"].forEach((record) => {
                console.log(record["_source"], realm.accountEmail)
                if ( record["_source"]["email"] === realm.accountEmail ) { var realmMemberType = 'Owner'}
                else { realmMemberType = 'Member' }
                html = html + `
                    <tr>
                    <td width="40px"><img src="` + config.frontend.httpImgFolder + '/profile/' + record["_source"]["picture"] + `" height="24" width="24" /></td>
                    <td>` + record["_source"]["first_name"] + `</td>
                    <td>` + record["_source"]["family_name"] + `</td>
                    <td>` + record["_source"]["email"] + `</td><td>` + realmMemberType + `</td></tr>
                `
            })
        $("#" + this.parentName).html(html + '</table>')
        })
    }

    render = (parentName, realm) => {
        this.parentName = parentName
        this.addListMembers(realm)
    }
}

export default RealmListMembers