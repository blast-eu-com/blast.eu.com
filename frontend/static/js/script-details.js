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
import Script from './script.js'
var script = new Script()






const loadScript = function(scriptId) {
    return new Promise(function(resolve, reject) {
        script.listByIds([scriptId]).then(function(scriptData) {
            script.loadProps(scriptData["hits"]["hits"][0])
            resolve(true)
        })
    })
}

const loadScriptInfo = function() {
    $("#scriptDetails").html(setScriptDetailsTable())
}


const loadScriptDetails = async function() {
    // collect url params passed via HTTP GET method
    let urlParams = new URLSearchParams(window.location.href.split('?')[1])

    // confirm the node_id param is present and collect the current node_id
    if (urlParams.has("script_id")) {
        console.log(await loadScript(urlParams.get('script_id')))
        if ( await loadScript(urlParams.get("script_id")) ) {
            setPageTitle()
            setButtonDelAction()
            loadScriptInfo()
            loadScriptEditor()
        }
    }
}


window.loadScriptDetails = loadScriptDetails