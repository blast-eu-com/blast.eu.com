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

import PortMap from '../../portmap.js'
import Realm from '../../realm.js'
import FrontendConfig from '../../frontend.js'
import Script from '../../script.js'

var portmap = new PortMap()
var realm = new Realm()
var config = new FrontendConfig()
var script = new Script()

const ScriptForm = class {

    constructor() {
        this.pn = ''
        this.fd = {}
        this.scrName = undefined
        this.scrType = undefined
        this.scrDescription = undefined
        this.scrFilename = undefined
        this.scrShareable = undefined
        this.scrRawData = undefined
        this.scrLogoImgPath = undefined
        this.scrRoles = []
        this.scrShareableRealms = []
        this.frame = `
            <form>
                <div class="row mb-3">
                    <div id="inputScriptFileContainer" class="col-md-6"></div>
                    <div id="inputScriptParamsContainer" class="col-md-6"></div>
                </div>
                <div class="row mb-3">
                    <div id="inputScriptDescriptionContainer" class="col-md-8"></div>
                    <div id="selectScriptLangContainer" class="col-md-4"></div>
                </div>
                <!--
                <div class="row mb-3">
                    <div id="scriptRolesSelectorContainer" class="col-md-6"></div>
                    <div class="col-md-6">
                        <label for="scriptRolesTagsContainer" class="form-label">Selected Roles</label>
                        <div id="scriptRolesTagsContainer" style="border: thin solid rgba(0,0,0,.125); border-radius: 5px; margin-bottom: 1rem;"></div>
                    </div>
                </div>
                -->
                <div id="scriptFormRealmsGroup" class="row mb-3">
                    <div class="col-md-6">
                        <div id="scriptShareableRealmsSelectorContainer"></div>
                    </div>
                    <div class="col-md-6">
                        <div id="scriptShareableRealmsTagsContainer" style="margin-bottom: 1rem"></div>
                    </div>
                    <div class="col-md-6">
                        <input class="custom-control-input" id="scriptShareableCheck"
                               type="checkbox" value="">
                        <label class="custom-control-label" for="scriptShareableCheck">Shareable</label>
                    </div>
                </div>
            </form>
        `
        this.inputScriptDescription = `
            <label for="scriptDesc" class="form-label">Script Description</label>
            <input id="scriptDesc" type="text" name="scriptDescription" class="form-control" />
            <div id="scriptDescHelp" class="form-text">Describe the new script in a few words.</div>
        `
        this.inputScriptParams = `
            <label for="scriptParams" class="form-label">Script Arguments</label>
            <input id="scriptParams" type="text" name="scriptParameters" class="form-control" />
            <div id="scriptParamsHelp" class="form-text">Put the arguments to be passed when executing this script.</div>
        `
        this.inputScriptFile = `
            <label for="inputGroupScript" class="form-label">Select a Script</label>
            <input type="file" name="scriptFileData" class="form-control" id="inputGroupScript">
            <div id="scriptFileHelp" class="form-text">The script name will be set as the filename.</div>
        `
    }

    set parentName(pn) { this.pn = pn }

    get parentName() { return this.pn }

    setFormData = () => {
        this.formData = {
            "script_description": $("input[name=scriptDescription]").val(),
            "script_file_data": $("input[name=scriptFileData]").prop("files")[0],
            "script_file_name": $("input[name=scriptFileData]").prop("files")[0]["name"],
            "script_type": $("select#scriptType option:selected").val(),
            "script_shareable": $("input#scriptShareableCheck").is(":checked"),
            "script_args": $("input#scriptParams").val(),
            "script_shareable_realms": this.scrShareableRealms
        }
    }

    addFrame = () => {
        $("#" + this.parentName).html(this.frame)
    }

    delShareableRealm = (realm) => {
        let scriptShareableRealms = this.shareableRealms
        scriptShareableRealms.splice(scriptShareableRealms.indexOf(realm), 1)
        this.shareableRealms = scriptShareableRealms
    }

    filterByScriptType(scriptType, type) {
        let bool = ( scriptType === 'any' || scriptType === type ) ? true : false
        return bool
    }

    filterByScriptName(scriptStr, name ) {
        if ( scriptStr !== '') {
            let regexp = new RegExp('.*' + scriptStr + '.*')
            var bool = (regexp.test(name)) ? true : false }
        else { var bool = true }
        return bool
    }

    addForm = () => {
        this.addFrame()
        $("#inputScriptDescriptionContainer").html(this.inputScriptDescription)
        $("#inputScriptParamsContainer").html(this.inputScriptParams)
        $("#inputScriptFileContainer").html(this.inputScriptFile)
        $("#selectScriptLangContainer").html(this.scriptLangs())
        // this.scriptRolesSelector()
        // $("#scriptRolesTagsContainer").html(this.scriptRolesBadges())
        realm.list().then((realms) => {
            if (realms["hits"]["total"]["value"] > 1) {
                $("#scriptShareableRealmsTagsContainer").html(this.scriptShareableRealmsBadges())
                this.scriptShareableRealmsSelector(realms)
            } else {
                $("#scriptFormRealmsGroup").hide()
            }
        })
    }

    scriptLangs = () => {
        let html = `
            <label for="scriptType" class="form-label">Script Lang</label>
            <select id="scriptType" class="form-select">
        `
        Object.keys(JSON.parse($.cookie('scriptlangs'))).forEach(function(key) {
            html = html + `<option value="` + key + `">` + key + `</option>`
        })
        return html + '</select>'
    }

    scriptShareableRealmsBadges = () => {
        let html = ''
        $("div#scriptShareableRealmsTagsContainer").html(html)
        if ( this.scrShareableRealms.length > 0 ) {
            this.scrShareableRealms.forEach(function(shareableRealm) {
                html = html + `
                <button class="btn blast-btn text-center" type="button" >` + shareableRealm + `
                    <span class="badge badge-light blast-badge" onclick="delShareableRealmSelected('` + shareableRealm + `');">X</span>
                </button>`
            })
        }
        $("div#scriptShareableRealmsTagsContainer").html(html)
    }

    scriptShareableRealmsSelector = (realms) => {
        let html = `<select id="scriptShareableRealmsSelector" class="form-select" size="5" onchange="addShareableRealmSelected();">`
        realm.list().then(function(realmList) {
            realms["hits"]["hits"].forEach(function(realmData) {
                let realmName = realmData["_source"]["name"]
                if ( realmName !== config.session.realm ) {
                    html = html + '<option value="' + realmName + '">' + realmName + '</option>'
                    $("#scriptShareableRealmsSelectorContainer").html(html)
                }
            })
        })
    }

    addShareableRealmSelected = () => {
        let shareableRealm = $("#scriptShareableRealmsSelector option:selected").val()
        if ( ! this.scrShareableRealms.includes(shareableRealm) ) {
            console.log(this.scrShareableRealms, shareableRealm)
            this.scrShareableRealms.push(shareableRealm)
            this.scriptShareableRealmsBadges()
        }
    }

    delShareableRealmSelected = (shareableRealm) => {
        if ( this.scrShareableRealms.includes(shareableRealm) ) {
            let index = this.scrShareableRealms.indexOf(shareableRealm)
            this.scrShareableRealms.splice(index, 1)
            this.scriptShareableRealmsBadges()
        }
    }

    scriptRolesBadges = () => {
        let html = ''
        let roles = this.scriptRoles
        $("div#scriptRolesTagsContainer").html(html)
        if (roles !== undefined ) {
            roles.forEach(function (role) {
                html = html + `<button class="btn blast-btn m-1" type="button" >
                ` + role + `<span class="badge badge-light ms-1" onclick="delRoleSelected('` + role + `');">X</span>
                </button>`
            })
        }
        return html
    }

    scriptRolesSelector = () => {
        let html = `
            <label id="scriptRolesSelector" class="form-label">Script Roles</label>
            <select id="scriptRolesSelector" class="form-select" size="5" onchange="addRoleSelected();">
        `
        portmap.list().then(function(portmapList) {
            if ( portmapList["hits"]["total"]["value"] > 0 ) {
                portmapList["hits"]["hits"].forEach(function(pmap) {
                    let role = undefined
                    if (pmap["_source"]["protocol"]) { role = pmap["_source"]["protocol"]
                    } else if (pmap["_source"]["application"]) { role = pmap["_source"]["application"] }

                    if (role !== undefined ) {
                        html = html + '<option value="' + role + '">' + role + '</option>'
                        $("#scriptRolesSelectorContainer").html(html)
                    }
                })
            }
        })
    }

    addRoleSelected = () => {
        let role = $("#scriptRolesSelector option:selected").val()
        if ( ! this.roles.includes(role) ) {
            this.scrRoles.push(role)
            this.scriptRolesBadges()
        }
    }

    delRoleSelected = (role) => {
        if ( this.roles.includes(role) ) {
            this.scrRoles.splice(this.roles.indexOf(role), 1)
            this.scriptRolesBadges()
        }
    }

    addScript = () => {
        this.setFormData()
        script.add(this.formData).then(function(Resp) {
            if ( Resp["result"] === "created" ) {
                location.reload()
            }
        })
    }

    render = (parentName) => {
        this.parentName = parentName
        this.addForm()
    }

}


export default ScriptForm