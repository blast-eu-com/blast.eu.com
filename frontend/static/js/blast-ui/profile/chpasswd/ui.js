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


import AccountPassword from './form.js'
import Account from "../../../aaa.js"

var accountPassword = new AccountPassword()
var account = new Account()

const changeAccountPassword = () => {

    let oldPassword = $("#accountOldPassword").val()
    let newPasswordA = $("#accountNewPasswordA").val()
    let newPasswordB = $("#accountNewPasswordB").val()

    if ( oldPassword !== "" && newPasswordA === newPasswordB ) {
        if ( oldPassword !== newPasswordA) {
            let account_data = {"oldPassword": oldPassword, "newPassword": newPasswordA}
            account.updatePassword(account_data).then((Resp) => {
                if ( Resp["result"] == "updated" ) { account.logout() }
            })
        }
    }

}

function main() {
    accountPassword.render("profilePasswordForm")
}


window.main = main
window.changeAccountPassword = changeAccountPassword






