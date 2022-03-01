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

import ScriptList from './list.js'
import ScriptForm from './form.js'
var scriptList = new ScriptList()
var scriptForm = new ScriptForm()

const main = function() {
    scriptForm.render('scriptForm')
    scriptList.render('scriptList')
}

window.main = main
window.simpleListGoToPrevPage = scriptList.simpleListGoToPrevPage
window.simpleListGoToNextPage = scriptList.simpleListGoToNextPage
window.simpleListGoToThisPage = scriptList.simpleListGoToThisPage
window.simpleListWindowDisplayNewRange = scriptList.simpleListWindowCoreData
window.loadScriptDetails = scriptList.simpleListWindowCoreData
window.addScript = scriptForm.addScript
window.addRoleSelected = scriptForm.addRoleSelected
window.addShareableRealmSelected = scriptForm.addShareableRealmSelected
window.delRoleSelected = scriptForm.delRoleSelected
window.delShareableRealmSelected = scriptForm.delShareableRealmSelected