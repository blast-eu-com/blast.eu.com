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
import FrontendConfig from './frontend.js'
import Account from './account.js'
var config = new FrontendConfig()
var account = new Account()

class Script {
    constructor() {
        this._id = undefined
        this._name = undefined
        this._type = undefined
        this._description = undefined
        this._roles = []
        this._filename = undefined
        this._filedata = undefined
        this._shareable = undefined
        this._shareableRealms = []
        this._data = undefined
        this._logoImgPath = undefined
        this._fd = undefined
    }

    set parentName(pn) { this.pn = pn }
    set formData(fd) { this._fd = fd }
    set id(id) { this._id = id }
    set name(name) { this._name = name }
    set description(description) { this._description = description }
    set roles(roles) { this._roles = roles }
    set fileName(filename) { this._filename = filename }
    set fileData(fileData) { this._filedata = fileData }
    set rawData(rawData) { this._data = rawData }
    set type(type) { this._type = type }
    set shareable(shareable) { this._shareable = shareable }
    set shareableRealms(shareableRealms) { this._shareableRealms = shareableRealms }
    set logoImgPath(imgPath) { this._logoImgPath = imgPath }

    get parentName() { return this.pn }
    get formData() { return this._fd }
    get id() { return this._id }
    get name() { return this._name }
    get description() { return this._description }
    get roles() { return this._roles }
    get fileName() { return this._filename}
    get fileData() { return this._filedata }
    get rawData() { return this._data }
    get type() { return this._type }
    get shareable() { return this._shareable }
    get shareableRealms() { return this._shareableRealms }
    get logoImgPath() { return this._logoImgPath }



    add = (data) => {
        let formData = new FormData()
        formData.append("script_description", data["script_description"])
        formData.append("script_file_data", data["script_file_data"])
        formData.append("script_file_name", data["script_file_name"])
        // formData.append("script_roles", data["script_roles"])
        formData.append("script_args", data["script_args"])
        formData.append("script_shareable", data["script_shareable"])
        formData.append("script_shareable_realms", data["script_shareable_realms"])
        formData.append("script_type", data["script_type"])

        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm +'/scripts',
                type: "POST",
                headers: {"Authorization": config.session.httpToken },
                data: formData,
                contentType: false,
                processData: false,
                success: (Resp) => {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    delete = (scriptId) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/scripts',
                type: "DELETE",
                headers: {"Authorization": config.session.httpToken },
                data: JSON.stringify({"script_id": scriptId}),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: (Resp) => {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    list = () => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/scripts',
                type: "GET",
                headers: {"Authorization": config.session.httpToken},
                success: (Resp) => {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    listById = (scriptId) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/scripts/' + scriptId,
                method: "GET",
                headers: { "Authorization": config.session.httpToken },
                success: (Resp) => {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    listByName = (name) => {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/scripts/name/' + name,
                method: "GET",
                headers: { "Authorization": config.session.httpToken },
                success: (Resp) => {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    listByRole = (role) => {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + config.session.realm + '/scripts/roles/' + role,
                method: "GET",
                headers: { "Authorization": config.session.httpToken },
                success: (Resp) => {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    listLang = () => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/scripts/langs',
                method: "GET",
                headers: { "Authorization": config.session.httpToken },
                success: (Resp) => {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    load = (scriptData) => {
        this.id = scriptData["_id"]
        this.name = scriptData["_source"]["name"]
        this.fileName = scriptData["_source"]["filename"]
        this.description = scriptData["_source"]["description"]
        this.rawData = scriptData["_source"]
        this.type = scriptData["_source"]["type"]

        if (Object.keys(JSON.parse($.cookie('scriptlangs'))).includes(scriptData["_source"]["type"])) {
            this.logoImgPath = "/img/script/" + JSON.parse($.cookie('scriptlangs'))[scriptData["_source"]["type"]]
        } else {
            this.logoImgPath = "/img/bootstrap-icons/file-code.svg"
        }
    }

    listByFilter = (scriptStr, scriptType) => {
        let scriptList = []
        return new Promise((resolve, reject) => {
            this.list().then((Resp) => {
                if ( Resp["hits"]["hits"].length > 0 ) {
                    Resp["hits"]["hits"].forEach((record) => {
                        let filterType = scriptObj.filterByScriptType(scriptType, record["_source"]["type"])
                        let filterStr = scriptObj.filterByScriptName(scriptStr, record["_source"]["name"])
                        if (filterType && filterStr) { scriptList.push(record) }
                    })
                }
                resolve(scriptList)
            })
        })
    }


}

export default Script