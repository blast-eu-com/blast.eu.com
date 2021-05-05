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
import FrontendConfig from './frontend.js'
let config = new FrontendConfig()

let msgAccountPasswordFailure = `
    <div aria-live="assertive" aria-atomic="true" class="toast fade show" data-autohide="false" >
        <div class="toast-header">
        <strong class="mr-auto">Blast</strong>
        <small>now</small>
        <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>
    <div class="toast-body">
        <h5>Authentication Failure, Password is not correct.</h5>
    </div>
`

let msgAccountFailure =  `
    <div aria-live="assertive" aria-atomic="true" class="toast fade show" data-autohide="false" >
        <div class="toast-header">
        <strong class="mr-auto">Blast</strong>
        <small>now</small>
        <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>
    <div class="toast-body">
        <h5>Authentication Failure, Account is not found.</h5>
    </div>
`

const Account = class {

    constructor() {
        this.email = undefined
        this.password = undefined
    }

    set accountEmail(accountEmail) { this.email = accountEmail }
    set accountPassword(accountPassword) { this.password = accountPassword }

    get accountEmail() { return this.email }
    get accountPassword() { return this.password }

    add = function(formData) {

        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/aaa/accounts',
                type: "POST",
                data: JSON.stringify(formData),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(Resp) {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logoutAccount()
                        } else { resolve(Resp)}
                }
            })
        })
    }

    update = function(data) {

        let formData = new FormData()
        formData.append("web_server_path", config.frontend.webServerPath)
        formData.append("account_profile_picture", data["accountPicture"])
        formData.append("account_profile_first_name", data["accountFirstName"])
        formData.append("account_profile_family_name", data["accountFamilyName"])
        formData.append("account_profile_email", data["accountEmail"])

        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/aaa/accounts/' + config.session.accountId,
                type: "PUT",
                data: formData,
                headers: {"Authorization": config.session.httpToken},
                contentType: false,
                processData: false,
                success: function(Resp) {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp)}
                    if (Object.keys(Resp).includes("tokenExpired")) {account.logoutAccount()
                        } else { resolve(Resp) }
                }
            })
        })
    }

    activateRealm = function(realm) {

        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/aaa/accounts/realms/' + realm,
                type: "POST",
                headers: {"Authorization": config.session.httpToken},
                success: function(Resp) {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp)}
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logoutAccount()
                        } else { resolve(Resp) }
                }
            })
        })
    }

    delete = function(formData) {

        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/aaa/accounts',
                type: "DELETE",
                data: JSON.stringify(formData),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(Resp) {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Objects.keys(Resp).includes("tokenExpired")) { account.logoutAccount()
                        } else { resolve(Resp)}
                }
            })
        })
    }

    list = function() {

        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/aaa/accounts',
                type: "GET",
                headers: {"Authorization": config.session.httpToken},
                success: function(Resp) {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logoutAccount()
                        } else { resolve(Resp) }
                }
            })
        })
    }

    listByRealm = function(realm) {

        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/realms/' + realm + '/accounts',
                type: "GET",
                headers: {"Authorization": config.session.httpToken},
                success: function(Resp) {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logoutAccount()
                        } else { resolve(Resp) }
                }
            })
        })
    }

    listById = function(accountId) {

        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/aaa/accounts/' + config.session.accountId,
                type: "GET",
                headers: {"Authorization": config.session.httpToken},
                success: function(Resp) {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) { account.logoutAccount()
                        } else { resolve(Resp) }
                }
            })
        })
    }

    getFormData = function() {

        return {
            "email": this.accountEmail,
            "password": this.accountPassword
        }
    }

    setFormData = function() {

        this.accountEmail = $("input[name=accountEmail]").val()
        this.accountPassword = $("input[name=accountPassword]").val()
    }

    loadAccountProfile = function(accountEmail) {

        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/aaa/accounts/profile',
                type: "GET",
                headers: {"Authorization": 'Bearer ' + $.cookie('jwt')},
                data: "email=" + accountEmail,
                success: function(Resp) {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if ( Object.keys(Resp).includes("tokenExpired")) { account.logoutAccount()
                        } else { resolve(Resp) }
                }
            })
        })
    }

    login = function(formData) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: config.proxyAPI + '/aaa/accounts/login',
                type: "POST",
                data: JSON.stringify(formData),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(Resp) {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) {
                        account.logoutAccount()
                    } else if (Object.keys(Resp).includes("failure")) {
                        if (Object.values(Resp).includes("AccountPasswordNotCorrect")) {
                            var toasterContent = $("#toaster").html() + msgAccountPasswordFailure
                        } else if (Object.values(Resp).includes("AccountNotFound")) {
                            var toasterContent = $("#toaster").html() + msgAccountFailure
                        }
                        $("#toaster").html('')
                        $("#toaster").html(toasterContent)
                        $(".toast").toast("show")
                    } else {
                        resolve(Resp)
                    }
                }
            })
        })
    }

    accountCookies = function() {

        let localAccount = this
        return new Promise(function(resolve, reject) {
            localAccount.loadAccountProfile(localAccount.accountEmail)
                .then(function(accountProfile) {
                    console.log(accountProfile)
                    $.cookie.json = true
                    $.cookie('account', accountProfile["account"], {path: "/"})
                    $.cookie('realm', accountProfile["realm"], {path: "/"})
                    $.cookie('setting', accountProfile["setting"], {path: "/"})
                    $.cookie('scriptlangs', accountProfile["scriptlangs"], {path: "/"})
                    resolve(true)
            })
        })
    }

    loginAccount = function() {

        let localAccount = this
        this.setFormData()
        this.login(this.getFormData())
            .then(function(accountLoginResult) {
                if ( Object.keys(accountLoginResult).includes("jwt") ) {
                    $.cookie('jwt', accountLoginResult["jwt"], {path: "/"})
                    localAccount.accountCookies()
                        .then(function(setCookieResult) {
                            if (setCookieResult) { location.href = "/html/home.html" }
                        })
                }
            })
    }

    logoutAccount = function() {
        window.location.href = "/html/logout.html"
    }

    registerAccount = async function() {
        this.setFormData()
        let R = await this.add(this.getFormData())
    }
}

let account = new Account()

const loginAccount = function() {
    account.loginAccount()
}

const logoutAccount = function() {
    account.logoutAccount()
}

const registerAccount = function() {
    account.registerAccount()
        .then(function(resp) {}
        )
}

window.registerAccount = registerAccount
window.loginAccount = loginAccount
window.logoutAccount = logoutAccount

export default Account