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
import FrontendConfig from './frontend.js'
import Toast from './blast-ui/main/notification/toast.js'
import {dictionary} from './blast-ui/main/message/en/dictionary.js'

let config = new FrontendConfig()
let toast = new Toast()
toast.msgPicture = '/'


const Account = class {

    constructor() {
        this._loginEmail
        this._loginPassword
        this._registerEmail
        this._registerPassword
        this._realm
    }

    set loginEmail(email) { this._loginEmail = email }
    set loginPassword(password) { this._loginPassword = password }
    set registerEmail(email) { this._registerEmail = email }
    set registerPassword(password) { this._registerPassword = password }
    set realm(realm) { this._realm = realm }

    get loginEmail() { return this._loginEmail }
    get loginPassword() { return this._loginPassword }
    get registerEmail() { return this._registerEmail }
    get registerPassword() { return this._registerPassword }
    get realm() { return this._realm }

    add = async (formData) => {
        let url = config.proxyAPI + '/aaa/accounts'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8" }
        let data = JSON.stringify(formData)
        let response = await fetch(url, {method: 'POST', headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { this.logout() } else { return response }
        }
    }

    update = async (data) => {
        let formData = new FormData()
        formData.append("web_server_path", config.frontend.webServerPath)
        formData.append("account_profile_picture", data["accountPicture"])
        formData.append("account_profile_first_name", data["accountFirstName"])
        formData.append("account_profile_family_name", data["accountFamilyName"])
        formData.append("account_profile_email", data["accountEmail"])
        data = formData
        let url = config.proxyAPI + '/aaa/accounts/' + config.session.accountId
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: 'PUT', headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { this.logout() } else { return response }
        }
    }

    updatePassword = async (account_data) => {
        let id = config.session.accountId
        let newPassword = account_data["newPassword"]
        let oldPassword = account_data["oldPassword"]
        account_data = {"id": id, "old_password": oldPassword, "new_password": newPassword}
        let url = config.proxyAPI + '/aaa/accounts/password'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8" }
        let data = JSON.stringify(account_data)
        let response = await fetch(url, {method: 'PUT', headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { this.logout() } else { return response }
        }
    }

    delete = async (formData) => {
        let url = config.proxyAPI + '/aaa/accounts'
        let header = { 'Authorization': config.session.httpToken, 'Content-Type': "application/json; charset=utf-8" }
        let data = JSON.stringify(formData)
        let response = await fetch(url, {method: "DELETE", headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { this.logout() } else { return response }
        }
    }

    list = async () => {
        let url = config.proxyAPI + '/aaa/accounts'
        let header = { 'Authorization': config.session.httpToken }
        let response = await fetch(url, {method: "GET", headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { this.logout() } else { return response }
        }
    }

    listById = async (accountId) => {
        let url = config.proxyAPI + '/aaa/accounts/' + config.session.accountId
        let header = { 'Authorization': config.session.httpToken}
        let response = await fetch(url, {method: "GET", headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { this.logout() } else { return response }
        }
    }

    getFormRegisterData = () => {
        return {
            "email": this.registerEmail,
            "password": this.registerPassword,
            "realm_name": this.realm,
            "realm_active": true,
            "realm_role": "owner"
        }
    }

    getFormLoginData = () => {
        return { "email": this.loginEmail, "password": this.loginPassword }
    }

    setFormRegisterData = () => {
        this.registerEmail = $("input[name=registerAccountEmail]").val()
        this.registerPassword = $("input[name=registerAccountPassword]").val()
        this.realm = $("#checkboxDefaultRealm").is(':checked') ? "default" : $("#registerAccountRealm").val()
    }

    setFormLoginData = () => {
        this.loginEmail = $("input[name=loginAccountEmail]").val()
        this.loginPassword = $("input[name=loginAccountPassword]").val()
    }

    authenticate = async (formData) => {
        let url = config.proxyAPI + '/aaa/accounts/authenticate'
        let header = { 'Content-Type': "application/json; charset=utf-8" }
        let data = JSON.stringify(formData)
        let response = await fetch(url, {method: 'POST', headers: header, body: data})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { this.logout() } else { return response }
        }
    }

    cookies = (email) => {
        return new Promise((resolve, reject) => {
            this.profile(email).then((profile) => {
                $.cookie.json = true
                $.cookie.raw = true
                $.removeCookie('account', {path: "/"})
                $.removeCookie('realm', {path: "/"})
                $.removeCookie('realms', {path: "/"})
                $.removeCookie('setting', {path: "/"})
                $.removeCookie('scriptlangs', {path: "/"})
                $.cookie('account', profile["account"], {path: "/"})
                $.cookie('realm', profile["realm"], {path: "/"})
                $.cookie('realms', profile["realms"], {path: "/"})
                $.cookie('setting', profile["setting"], {path: "/"})
                $.cookie('scriptlangs', profile["scriptlangs"], {path: "/"})
                resolve(true)
            })
        })
    }

    profile = async (email) => {
        let url = config.proxyAPI + '/aaa/accounts/profile/' + email
        let header = { 'Authorization': 'Bearer ' + $.cookie('jwt')}
        let response = await fetch(url, {method: "GET", headers: header})
        if (response.ok) {
            response = JSON.parse(await response.text())
            if (Object.keys(response).includes("tokenExpired")) { this.logout() } else { return response }
        }
    }

    login = () => {
        this.setFormLoginData()
        let actionRes, loginData = this.getFormLoginData()
        this.authenticate(loginData).then((accountLoginResult) => {
            if ( Object.keys(accountLoginResult).includes("jwt") ) {
                $.cookie('jwt', accountLoginResult["jwt"], {path: "/"})
                this.cookies(loginData["email"]).then((setCookieResult) => {
                    if (setCookieResult) { location.href = "/html/infrastructure.html" }
                })
            } else if ( Object.keys(AccountLoginResult).includes("failure") ) {
                actionRes = "failure"
                toast.msgTitle = 'Login Failure'
                toast.msgText = Resp["failure"]
                toast.notify(actionRes)
                setTimeout(() => { location.reload() }, 2000)
            }
        })
    }

    logout = () => {
        window.location.href = "/html/logout.html"
    }

    register = async () => {
        this.setFormRegisterData()
        let actionRes, registerData = this.getFormRegisterData()
        this.add(registerData).then((Resp) => {
            if ( Resp["result"] == "created" ) {
                toast.msgTitle = "Account create Success"
                toast.msgText = dictionary["account"]["add"].replace('%accountName%', registerData["email"])
                actionRes = "success"
            } else {
                toast.msgTitle = "Account create Failure"
                toast.msgText = Resp["failure"]
                actionRes = "failure"
            }
            toast.notify(actionRes)
            setTimeout(() => { location.reload() }, 2000)
        })
    }
}



export default Account