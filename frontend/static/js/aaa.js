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
        this._email = undefined
        this._password = undefined
    }

    set email(email) { this._email = email }
    set password(password) { this._password = password }

    get email() { return this._email }
    get password() { return this._password }

    add = (formData) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/aaa/accounts',
                type: "POST",
                data: JSON.stringify(formData),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: (Resp) => {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) {
                        this.logout()
                    } else { resolve(Resp)}
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
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp)}
                    if (Object.keys(Resp).includes("tokenExpired")) {
                        this.logout()
                    } else { resolve(Resp) }
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
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Objects.keys(Resp).includes("tokenExpired")) {
                        this.logout()
                    } else { resolve(Resp)}
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
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) {
                        this.logout()
                    } else { resolve(Resp) }
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
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) {
                        this.logout()
                    } else { resolve(Resp) }
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
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) {
                        this.logout()
                    } else { resolve(Resp) }
                }
            })
        })
    }

    activateRealm = (realm) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: config.proxyAPI + '/aaa/accounts/realms/' + realm,
                type: "POST",
                headers: {"Authorization": config.session.httpToken},
                success: (Resp) => {
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp)}
                    if (Object.keys(Resp).includes("tokenExpired")) {
                        this.logout()
                    } else { resolve(Resp) }
                }
            })
        })
    }

    // joinRealm = () => { }

    // leaveRealm = () => { }

    // isRealmMember = () => { }

    getFormData = () => {
        return {
            "email": this.email,
            "password": this.password
        }
    }

    setFormData = () => {
        this.email = $("input[name=accountEmail]").val()
        this.password = $("input[name=accountPassword]").val()
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
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if (Object.keys(Resp).includes("tokenExpired")) {
                        this.logout()
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
                    if (typeof Resp === 'string') { Resp = JSON.parse(Resp) }
                    if ( Object.keys(Resp).includes("tokenExpired")) {
                        this.logout()
                    } else { resolve(Resp) }
                }
            })
        })
    }

    login = () => {
        this.setFormData()
        let loginData = this.getFormData()
        this.authenticate(loginData).then((accountLoginResult) => {
            if ( Object.keys(accountLoginResult).includes("jwt") ) {
                $.cookie('jwt', accountLoginResult["jwt"], {path: "/"})
                this.cookies(loginData["email"]).then((setCookieResult) => {
                    if (setCookieResult) { location.href = "/html/infrastructure.html" }
                })
            }
        })
    }

    logout = () => {
        window.location.href = "/html/logout.html"
    }

    register = async () => {
        this.setFormData()
        let loginData = this.getFormData()
        let R = await this.add(loginData)
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