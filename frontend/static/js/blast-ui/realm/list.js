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

import Realm from '../../realm.js'
import FrontendConfig from '../../frontend.js'

var config = new FrontendConfig()
var realm = new Realm()

const RealmList = class {

    constructor() { }

    templateList = (realms) => {
        let html = `<table class="table table-sm" style="font-size: small">
        <thead><tr><th></th><th>Name</th><th>State</th></tr></thead>`
        let activeRealm = ''
        realms.forEach((rlm) => {
            if ( rlm["key"] === config.session.realm ) { activeRealm = 'Active' } else { activeRealm = ''}
            html = html + `
                <tr>
                <td width="40px"><img src="/img/bootstrap-icons/circle.svg" height="24" width="24" /></td>
                <td><a href="/html/realm-details.html?realm_name=` + rlm["key"] + `">` + rlm["key"] + `</a></td>
                <td>` + activeRealm + `</td>
                </tr>`
        })
        return html
    }

    loadRealmList = () => {
        realm.listByUniqName().then((realmData) => {
            $("#realmListPagination").pagination({
                dataSource: realmData["aggregations"]["aggregate_by_name"]["buckets"],
                pageSize: 60,
                callback: (data, pagination) => {
                    let html = this.templateList(data)
                    $("#realmList").html(html)
                }
            })
        })
    }

    render = () => {
        this.loadRealmList()
    }

}

export default RealmList