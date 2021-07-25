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

import Realm from '../../realm.js'
import RealmForm from './form.js'
import RealmList from './list.js'
import RealmSwitch from './switch.js'

var realm = new Realm()
var realmForm = new RealmForm()
var realmList = new RealmList()
var realmSwitch = new RealmSwitch()

function main() {
    realmForm.render("realmForm")
    realmList.render("realmList", realm)
    realmSwitch.render("realmSwitch")
}

window.main = main
window.addRealm = realmForm.addRealm
window.switchRealm = realmSwitch.switchRealm