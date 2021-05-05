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
import Realm from './realm.js'
import FrontendConfig from "./frontend.js";
import Account from './aaa.js'
let realm = new Realm()
let account = new Account()
let config = new FrontendConfig()

const setButtonDeleteAction = function() {
    $('#containerRealmActions').html(`<a id="btnDelRealm" class="btn btn-sm btn-primary ml-auto">Delete</a>`)
    $('#btnDelRealm').on("click", async function() {
        let R = await realm.delete(realm.realmId)
        if ( R["result"] === "deleted" ) { location.href = "/html/realm.html" }
    })
}

const setButtonJoinAction = function() {
    $('#containerRealmActions').html(`<a id="btnJoinRealm" class="btn btn-primary ml-auto">join</a>`)
    $('#btnJoinRealm').on("click", async function() {})
}

const setPageTitle = function() {
    $('#navRealmName').html(realm.realmName)
}

const setRealmDetailsTable = function() {
    let html = `<img style="margin-left: 1rem; margin-bottom: 1rem" src="/img/object/realm.svg" height="56" width="56" />
    <table class="table"><thead></thead><tr><td><b>Realm id</b></td><td>` + realm.realmId + `</td></tr>`
    $.each(realm.realmRawData, function(idx, val) {
        if ( idx === "settings" ) { val = JSON.stringify(val) }
            html = html + '<tr><td><b>' + idx.charAt(0).toUpperCase() + idx.slice(1) + '</b></td><td>' + val + '</td></tr>'
        })
    return html + '</table>'
}

const loadRealm = function(realmId) {
    return new Promise(function(resolve, reject) {
        realm.listById(realmId).then(function (realmData) {
            if (realmData["found"]) {
                realm.load(realmData)
                resolve(true)
            }
        })
    })
}

const loadRealmDetails = function() {
    let urlParams = new URLSearchParams(window.location.href.split('?')[1])
    if ( urlParams.has("realm_id") ) {
        let realmId = urlParams.get("realm_id")
        loadRealm(realmId).then(function(res) {
            setPageTitle()
            loadRealmInfo()
            loadRealmMembers()
        })
    }
}

const loadRealmInfo = function() {
     console.log(realm.name)
     if ( realm.name !== 'default') {
        console.log('passing thru anyways')
        if ( config.session.realm !== realm.name ) {
            //add delete button if the user is the owner of the realm and the realm name is not default
            if (config.session.accountEmail === realm.realmAccountEmail) { setButtonDeleteAction(realm.realmId) }
            //add join button if the account is not the owner of the realm
            else if (realm.realmName !== "default") { setButtonJoinAction() }
        }
     }
     //let realmDetailsTable = setRealmDetailsTable()
     $("#realmDetails").html(setRealmDetailsTable())
}

const loadRealmMembers = function() {
    let html = '<table class="table">'
    account.listByRealm(realm.realmName).then(function(accounts) {
        if ( accounts["hits"]["total"]["value"] > 0 ) {
            accounts["hits"]["hits"].forEach(function(record) {
                if ( record["_source"]["email"] === realm.realmAccountEmail ) { var realmMemberType = 'Owner'}
                else { realmMemberType = 'Member' }
                html = html + `<tr>
                <td width="40px"><img src="` + config.frontend.httpImgFolder + '/profile/' + record["_source"]["picture"] + `" height="24" width="24" /></td>
                <td>` + record["_source"]["first_name"] + `</td>
                <td>` + record["_source"]["family_name"] + `</td>
                <td>` + record["_source"]["email"] + `</td><td>` + realmMemberType + `</td></tr>`
            })
        }
        $("#realmMembers").html(html + '</table>')
    })
}

window.loadRealmDetails = loadRealmDetails



