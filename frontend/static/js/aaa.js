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
import Toast from './blast-ui/main/notification/toast.js'

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

    add = (formData) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/aaa/accounts',
                type: "POST",
                data: JSON.stringify(formData),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: (Resp) => {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    update = (data) => {
        let formData = new FormData()
        formData.append("web_server_path", config.frontend.webServerPath)
        formData.append("account_profile_picture", data["accountPicture"])
        formData.append("account_profile_first_name", data["accountFirstName"])
        formData.append("account_profile_family_name", data["accountFamilyName"])
        formData.append("account_profile_email", data["accountEmail"])

        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/aaa/accounts/' + config.session.accountId,
                type: "PUT",
                data: formData,
                headers: {"Authorization": config.session.httpToken},
                contentType: false,
                processData: false,
                success: (Resp) => {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    updatePassword = (account_data) => {
        var id = config.session.accountId
        var newPassword = account_data["newPassword"]
        var oldPassword = account_data["oldPassword"]
        var data = {"id": id, "old_password": oldPassword, "new_password": newPassword}
        console.log(id, newPassword, oldPassword)
        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/aaa/accounts/password',
                type: "PUT",
                data: JSON.stringify(data),
                headers: {"Authorization": config.session.httpToken},
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: (Resp) => {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    delete = (formData) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/aaa/accounts',
                type: "DELETE",
                data: JSON.stringify(formData),
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
                url: config.proxyAPI + '/aaa/accounts',
                type: "GET",
                headers: {"Authorization": config.session.httpToken},
                success: (Resp) => {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    listByRealm = (realm) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/realms/' + realm + '/accounts',
                type: "GET",
                headers: {"Authorization": config.session.httpToken},
                success: (Resp) => {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    listById = (accountId) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/aaa/accounts/' + config.session.accountId,
                type: "GET",
                headers: {"Authorization": config.session.httpToken},
                success: (Resp) => {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    activateRealm = (realm) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/aaa/accounts/realms',
                type: "PUT",
                data: JSON.stringify({"realm": realm}),
                headers: {"Authorization": config.session.httpToken},
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: (Resp) => {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    getFormRegisterData = () => {
        return { "email": this.registerEmail, "password": this.registerPassword, "realm": this.realm }
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

    authenticate = (formData) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/aaa/accounts/authenticate',
                type: "POST",
                data: JSON.stringify(formData),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: (Resp) => {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    cookies = (email) => {
        return new Promise((resolve, reject) => {
            this.profile(email).then((profile) => {
                console.log(profile)
                $.cookie.json = true
                $.cookie.raw = true
                $.removeCookie('account', {path: "/"})
                $.cookie('account', profile["account"], {path: "/"})
                $.removeCookie('realm', {path: "/"})
                $.cookie('realm', profile["realm"], {path: "/"})
                $.removeCookie('setting', {path: "/"})
                $.cookie('setting', profile["setting"], {path: "/"})
                $.removeCookie('scriptlangs', {path: "/"})
                $.cookie('scriptlangs', profile["scriptlangs"], {path: "/"})
                resolve(true)
            })
        })
    }

    profile = (email) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/aaa/accounts/profile',
                type: "GET",
                headers: {"Authorization": 'Bearer ' + $.cookie('jwt')},
                data: "email=" + email,
                success: (Resp) => {
                    if ( typeof Resp === 'string' ) { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logout() } else { resolve(Resp) }
                }
            })
        })
    }

    login = () => {
        this.setFormLoginData()
        let loginData = this.getFormLoginData()
        this.authenticate(loginData).then((accountLoginResult) => {
            console.log(accountLoginResult)
            if ( Object.keys(accountLoginResult).includes("jwt") ) {
                $.cookie('jwt', accountLoginResult["jwt"], {path: "/"})
                this.cookies(loginData["email"]).then((setCookieResult) => {
                    if (setCookieResult) { location.href = "/html/infrastructure.html" }
                })
            } else if ( Object.keys(AccountLoginResult).includes("failure") ) {
                toast.msgTitle = 'Login Failure'
                toast.msgText = Resp["failure"]
                toast.notify()
            }
        })
    }

    logout = () => {
        window.location.href = "/html/logout.html"
    }

    register = async () => {
        this.setFormRegisterData()
        let registerData = this.getFormRegisterData()
        let R = await this.add(registerData)
    }
}

let account = new Account()
const loginAccount = function() { account.login() }
const logoutAccount = function() { account.logout() }
const registerAccount = function() { account.register().then((resp) => { }) }

window.registerAccount = registerAccount
window.loginAccount = loginAccount
window.logoutAccount = logoutAccount

export default Account