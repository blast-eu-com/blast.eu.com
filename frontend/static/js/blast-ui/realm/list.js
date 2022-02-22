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

import FrontendConfig from '../../frontend.js'

var config = new FrontendConfig()

const RealmList = class {

    constructor() { }

    addList = (realm) => {
        let html = `<table class="table">`
        let activeRealm = ''
        realm.listByUniqName().then((realms) => {
            realms["aggregations"]["aggregate_by_name"]["buckets"].forEach((record) => {
                if ( record["key"] === config.session.realm ) { activeRealm = 'Active' } else { activeRealm = ''}
                html = html + `
                    <tr>
                    <td width="40px"><img src="/img/bootstrap-icons/circle.svg" height="24" width="24" /></td>
                    <td><a href="/html/realm-details.html?realm_name=` + record["key"] + `">` + record["key"] + `</a></td>
                    <td>` + activeRealm + `</td>
                    </tr>`
                    $("#" + this.parentName).html(html)
            })
        })
    }

    render = (parentName, realm) => {
        this.parentName = parentName
        this.addList(realm)
    }

}

export default RealmList