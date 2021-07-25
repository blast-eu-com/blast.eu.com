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

import Realm from '../../../realm.js'
import RealmListInfo from './listInfo.js'
import RealmListMembers from './listMembers.js'

var realm = new Realm()
var realmListInfo = new RealmListInfo()
var realmListMembers = new RealmListMembers()

const setButtonLeaveAction = function(realm) {
    $('#containerRealmActions').html(`<a id="btnLeaveRealm" class="btn btn-sm btn-primary ml-auto">Delete</a>`)
    $('#btnLeaveRealm').on("click", async function() {
        let R = await realm.delete(realm.id)
        if ( R["result"] === "deleted" ) { location.href = "/html/realm.html" }
    })
}

const setButtonJoinAction = function() {
    $('#containerRealmActions').html(`<a id="btnJoinRealm" class="btn btn-primary ml-auto">join</a>`)
    $('#btnJoinRealm').on("click", async function() {})
}

const setPageAction = function() {

}

const setPageTitle = function(realm) {
    $('#navRealmName').html(realm.name)
}

async function main() {
    let urlParams = new URLSearchParams(window.location.href.split('?')[1])
    if ( urlParams.has("realm_id") ) {
        let realmId = urlParams.get("realm_id")
        let realmName = urlParams.get("realm_name")
        let realmData = await realm.listByIds([realmId])
        realm.load(realmData["hits"]["hits"][0])
        setPageTitle(realm)
        if ( realmName !== "default" ) { setPageAction() }
        realmListInfo.render('realmListInfo', realm)
        realmListMembers.render('realmListMembers', realm)
    }
}

window.main = main