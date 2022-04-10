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

import Script from '../../script.js'

var script = new Script()

const ScriptFilterAndSelect = class {

    constructor(parentName) {
        this.parentName = parentName
        this.frame = `
            <div class="input-group">
                <div class="input-group-text">
                    <img src="/img/bootstrap-icons-1.0.0-alpha5/search.svg" />
                </div>
                <input class="form-control form-control-sm" id="scriptNameSearch" type="text" />
                <select id="scriptTypeSelect" class="form-select form-select-sm col-3 mx-1">
                    <option value="any" selected>any</option>
                </select>
                <button class="btn blast-btn btn-sm" onclick="scriptSearchString();">Search</button>
            </div>
            <div id="selectAndSearchWindowFrameCore" class="mt-2"></div>
            <div id="scriptSearchWindowInteractive" class="row p-1 m-1"></div>

        `
    }

    addFrame = async () => {
        $("#" + this.parentName).html(this.frame)
        let selectOptions = '<option value="any" selected>any</option>'
        let selectData = await script.listLang()
        selectData["hits"]["hits"].forEach((selectOption) => {
            selectOptions = selectOptions + '<option value="' + selectOption["_source"]["name"] + '">' + selectOption["_source"]["name"] + '</option>'
        })
        $("#scriptTypeSelect").html(selectOptions)
        return true
    }

    scriptTypeSelected() {
        return $("select#scriptTypeSelect option:selected").val()
    }

    scriptStringSearch() {
        return $("input#scriptNameSearch").val()
    }

    templateScript(scriptData) {
        let html = `<table class="table table-sm"><thead><tr><th></th><th></th><th>Name</th><th>File name</th><th>Description</th></tr></thead>`
        let scriptIcon = "/img/bootstrap-icons/file-code.svg"
        scriptData.forEach((scr) => {
            if ( Object.keys(JSON.parse($.cookie('scriptlangs'))).includes(scr["_source"]["type"]) ) { scriptIcon = "/img/script/" + JSON.parse($.cookie('scriptlangs'))[scr["_source"]["type"]] }
            html = html + `<tr style="display:table-row">
            <td width="50px"><input name="scr" value="` + scr["_source"]["name"] + `" type="checkbox" style="margin-left: 10px"/></td>
            <td width="50px"><img src="` + scriptIcon + `" height="24" width="24" /></td>
            <td>` + scr["_source"]["name"] + `</td>
            <td>` + scr["_source"]["filename"] + `</td>
            <td>` + scr["_source"]["description"] + `</td>
            </tr>`
        })
        return html
    }

    filterScript = async () => {
        let scriptData
        let scriptType = this.scriptTypeSelected()
        let scriptName = this.scriptStringSearch()

        if (scriptName === '' && scriptType === 'any') {
            scriptData = await script.list()
        } else if (scriptName === '' && scriptType !== 'any') {
            scriptData = script.listByType(scriptType)
        } else if (scriptName !== '' && scriptType === 'any') {
            scriptData = script.searchByName(scriptName)
        } else if (scriptName !== '' && scriptType !== 'any') {
            scriptData = script.searchByNameAndType(scriptName, scriptType)
        }

        this.loadScript(scriptData)
    }


    loadScript = (myData) => {
        $("#scriptSearchWindowInteractive").pagination({
            dataSource: myData["hits"]["hits"],
            pageSize: 10,
            callback: (data, pagination) => {
                let html = this.templateScript(data)
                $("#selectAndSearchWindowFrameCore").html(html)
            }
        })
    }

    runScripts = () => {
        let scriptList = []
        $("input[name='scr']").each(function(data, tag) {
            if ( tag.checked ) { scriptList.push(tag.value) }
        })
        return scriptList
    }

    runScriptsId = async () => {
        let scriptsId = []
        let scriptsList = this.runScripts()
        for ( let i=0; i < scriptsList.length; i++ ) {
            let scriptData = await script.listByName(scriptsList[i])
            scriptsId.push(scriptData["hits"]["hits"][0]["_id"])
        }
        return scriptsId
    }

    render = () => {
        this.addFrame()
        this.filterScript()
    }
}

export default ScriptFilterAndSelect
