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



const AnsibleForm = class {

    constructor() {

        this._fd = undefined
        this.frame = `
            <form>
                <div id="ansible" class="row">
                    <div id="ansibleUsernameContainer" class="mb-2"></div>
                    <div id="ansiblePasswordContainer" class="mb-2"></div>
                    <div id="ansibleCertificateContainer" class="mb-2"></div>
                    <div id="ansibleInventoryLocationContainer" class="mb-2"></div>
                </div>
            </form>
        `
        this.inputAnsibleUsername = `
            <div>
                <label for="ansibleUserName" class="form-label">Ansible Username</label>
                <input id="ansibleUserName" type="text" name="ansibleUserName" class="form-control" />
                <div id="ansibleUserHelp" class="form-text">Define the Ansible username to run the Ansible scripts.</div>
            </div>
        `
        this.inputAnsiblePassword = `
            <div>
                <label for="ansibleUserPassword" class="form-label">Ansible Password</div>
                <input id="ansibleUserPassword" type="password" name="ansibleUserPassword" class="form-control" />
                <!-- <div id="ansibleUserPasswordHelp" class="form-text">Define the Ansible password for the Ansible username given.</div> -->
                <div id="ansibleUserPasswordHelp">
                    <input class="form-check-input" type="checkbox" value="" id="ansibleUserPasswordSet" disabled>
                    <label class="form-check-label" for="ansibleUserPasswordSet">Ansible Password set</label>
                </div>
            </div>
        `
        this.inputAnsibleCertificate = `
            <div>
                <label for="ansibleUserCertificate" class="form-label">Ansible Certificate</div>
                <input id="ansibleUserCertificate" type="text" name="ansibleUserCertificate" class="form-control" />
                <div id="ansibleUserCertificateHelp" class="form-text">Define the Ansible certificate for the Ansible username give.</div>
            </div>
        `
        this.inputAnsibleInventoryLocation = `
            <div>
                <label for="ansibleInventoryLocation" class="form-label">Ansible inventory location</div>
                <input id="ansibleInventoryLocation" type="text" name="ansibleInventoryLocation" class="form-control" />
                <div id="ansibleInventoryLocation" class="form-text">Set the ansible session location where ansible repository is stored.</div>
            </div>
        `
        this._parentName = undefined
    }

    set parentName(pn) { this._parentName = pn }
    set formData(fd) { this._fd = fd }

    get parentName() { return this._parentName }
    get formData() { return this._fd }

    addFrame = () => {
        $("#" + this.parentName).html(this.frame)
    }

    addForm = () => {
        this.addFrame()
        $("#ansibleUsernameContainer").html(this.inputAnsibleUsername)
        $("#ansiblePasswordContainer").html(this.inputAnsiblePassword)
        $("#ansibleCertificateContainer").html(this.inputAnsibleCertificate)
        $("#ansibleInventoryLocationContainer").html(this.inputAnsibleInventoryLocation)
        // Assign Ansible setting values directly from the cookie
        let ansible = JSON.parse($.cookie('setting'))["ansible"]
        $("#ansibleUserName").val(ansible["username"])
        $("#ansibleUserCertificate").val(ansible["certificate"])
        $("#ansibleInventoryLocation").val(ansible["inventory"]["location"])
        if (ansible["is_password_set"]) { $("#ansibleUserPasswordSet").prop("checked", true) }
    }

    render(parentName) {
        this.parentName = parentName
        this.addForm()
    }

}


export default AnsibleForm