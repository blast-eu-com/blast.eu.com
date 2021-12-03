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

import AnsibleForm from "./ansible/form.js"
import SshForm from "./ssh/form.js"
import Setting from '../../settings.js'

var ansibleForm = new AnsibleForm()
var sshForm = new SshForm()
var setting = new Setting()

function updateSettings() {

    let formData = {
        "ansible": {
            "username": $("#ansibleUserName").val(),
            "password": $("#ansibleUserPassword").val(),
            "certificate": $("#ansibleUserCertificate").val(),
            "inventory": {
                "location": $("#ansibleInventoryLocation").val()
            }
        },
        "ssh": {
            "username": $("#sshUsername").val(),
            "password": $("#sshPassword").val(),
            "certificate": $("#sshCertificate").val(),
            "location": $("#sshLocation").val()
        }
    }

    setting.save(formData).then(function(Resp) {
        if (Resp["result"] === "updated") {
            location.reload()
        }
    })
}

function main() {
    ansibleForm.render("ansibleForm")
    sshForm.render("sshForm")
}


window.main = main
window.updateSettings = updateSettings