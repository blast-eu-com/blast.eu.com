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

import ProfileForm from './form.js'
import Account from '../../account.js'

var account = new Account()
var profileForm = new ProfileForm()


const updateProfile = () => {
    let accountPicture = ($("input#accountPicture").prop("files")[0] === 'undefined') ? "undefined" : $("input#accountPicture").prop("files")[0]
    let profileData = {
        "accountPicture": accountPicture,
        "accountFirstName": $("input#accountFirstName").val(),
        "accountFamilyName": $("input#accountFamilyName").val(),
        "accountEmail": $("input#accountEmail").val()
    }
    let passwordA = $("input#accountPasswordA").val()
    let passwordB = $("input#accountPasswordB").val()
    if ( passwordA === passwordB ) {
        if ( passwordA !== "" ) {
            profileData["password"] = passwordA
        }

        account.update(profileData).then((Resp) => {
        console.log(Resp)
        // account.cookies(config.session.accountEmail).then((setCookieResult) => {
        //    console.log(setCookieResult)
            // nav.loadNavBarProfilePicture()
            // location.reload()
        // })
        })
    }
}

function main() {

    profileForm.render('profileForm')
}

window.main = main
window.updateProfile = updateProfile