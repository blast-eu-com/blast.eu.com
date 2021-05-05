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

import Account from './aaa.js'
import FrontendConfig from './frontend.js'
import Nav from './nav.js'
let account = new Account()
let config = new FrontendConfig()
let nav = new Nav()

const loadProfilePicture = function() {
    let accountPicture = (Object.keys(JSON.parse($.cookie("account"))).includes("picture")) ? JSON.parse($.cookie("account"))["picture"] : ""
    $("img#accountPicture").attr("src", config.frontend.httpImgFolder + '/profile/' + accountPicture)
}

const loadProfileFirstName = function() {
    let accountFirstName = (Object.keys(JSON.parse($.cookie("account"))).includes("first_name")) ? JSON.parse($.cookie("account"))["first_name"] : ""
    $("input#accountFirstName").val(accountFirstName)
}

const loadProfileFamilyName = function() {
    let accountFamilyName = (Object.keys(JSON.parse($.cookie("account"))).includes("family_name")) ? JSON.parse($.cookie("account"))["family_name"] : ""
    $("input#accountFamilyName").val(accountFamilyName)
}

const loadProfileEmail = function() {
    let accountEmail = (Object.keys(JSON.parse($.cookie("account"))).includes("email")) ? JSON.parse($.cookie("account"))["email"] : ""
    $("input#accountEmail").val(accountEmail)
}

const loadProfile = function() {
    loadProfilePicture()
    loadProfileFirstName()
    loadProfileFamilyName()
    loadProfileEmail()
}

const getFormData = function() {
    let accountPicture = ($("input#accountPicture").prop("files")[0] === 'undefined') ? "undefined" : $("input#accountPicture").prop("files")[0]
    return {
        "accountPicture": accountPicture,
        "accountFirstName": $("input#accountFirstName").val(),
        "accountFamilyName": $("input#accountFamilyName").val(),
        "accountEmail": $("input#accountEmail").val()
    }
}

const updateProfile = function() {
    let profileData = getFormData()
    account.update(profileData).then(function(Resp) {
        account.loadAccountProfile(config.session.accountEmail)
        nav.loadNavBarProfilePicture()
        location.reload()
    })
}

window.loadProfile = loadProfile
window.updateProfile = updateProfile