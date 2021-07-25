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


const RealmListInfo = class {

    constructor() { }

    addListInfo = (realm) => {
        let html = `
            <img style="margin-left: 1rem; margin-bottom: 1rem" src="/img/object/realm.svg" height="56" width="56" />
            <table class="table">
            <thead>
            </thead>
            <tr><td><b>Realm id</b></td><td>` + realm.id + `</td></tr>
        `
        $.each(realm.rawData, function(idx, val) {
            if ( idx === "settings" ) { val = JSON.stringify(val) }
            html = html + '<tr><td><b>' + idx.charAt(0).toUpperCase() + idx.slice(1) + '</b></td><td>' + val + '</td></tr>'
        })
        $("#" + this.parentName).html(html + '</table>')
    }

    render = (parentName, realm) => {
        this.parentName = parentName
        this.addListInfo(realm)
    }

}

export default RealmListInfo