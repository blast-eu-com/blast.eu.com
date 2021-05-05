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

import Script from '../../../../script.js'
import ScriptListInfo from './listInfo.js'
import ScriptContent from './content.js'

var script = new Script()
var scriptListInfo = new ScriptListInfo()
var scriptContent = new ScriptContent()

const setPageTitle = function(script) {
    console.log(script.name)
    $("#navScriptName").html(script.name)
}

const setButtonDelAction = function(script) {
    $('#btnDelScript').on("click", async function() {
        let scriptDeleteResp = await script.delete(script.id)
        if ( scriptDeleteResp["result"] === "deleted" ) {
            location.href = "/html/script.html" }
    })
}

async function main() {
    let urlParams = new URLSearchParams(window.location.href.split('?')[1])
    if (urlParams.has("script_id")) {
        let script_id = urlParams.get('script_id')
        let scriptData = await script.listByIds([script_id])
        script.load(scriptData["hits"]["hits"][0])
        setPageTitle(script)
        setButtonDelAction(script)
        scriptListInfo.render('scriptListInfo', script)
        scriptContent.render('scriptContent', script)
    }
}


window.main = main