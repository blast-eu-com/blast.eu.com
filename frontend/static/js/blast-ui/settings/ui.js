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

import FrontendConfig from '../../frontend.js'
import AnsibleForm from './ansible/form.js'
import SshForm from './ssh/form.js'
import Setting from '../../settings.js'
import Account from '../../account.js'
import Toast from '../main/notification/toast.js'
import {dictionary} from '../main/message/en/dictionary.js'

var config = new FrontendConfig()
var ansibleForm = new AnsibleForm()
var sshForm = new SshForm()
var setting = new Setting()
var account = new Account()
var toast = new Toast()

toast.msgPicture = '../../../img/bootstrap-icons/sliders.svg'

function updateSettings() {

    let formData = {
        "ansible": {
            "username": $("#ansibleUserName").val(),
            "password": $("#ansibleUserPassword").val(),
            "certificate": $("input[name=ansibleCertificate]").prop("files")[0],
            "inventory": {
                "location": $("#ansibleInventoryLocation").val()
            }
        },
        "ssh": {
            "username": $("#sshUsername").val(),
            "password": $("#sshPassword").val(),
            "certificate": $("input[name=sshCertificate]").prop("files")[0],
            "location": $("#sshLocation").val()
        }
    }

    setting.save(formData).then(function(Resp) {
        let actionRes
        if (Resp["result"] === "updated") {
            account.cookies(config.session.accountEmail)
            location.reload()
            toast.msgTitle = "Settings update Success"
            toast.msgText = dictionary["settings"]["update"]
            actionRes = "success"
        } else if (Object.keys(Resp).includes("failure")) {
            toast.msgTitle = "Settings update Failure"
            toast.msgText = Resp["failure"]
            actionRes = "failure"
        }
        toast.notify(actionRes)
        setTimeout(() => { location.reload() }, 2000 )
    })
}

const main = function() {
    ansibleForm.render("ansibleForm")
    sshForm.render("sshForm")
}


window.main = main
window.updateSettings = updateSettings