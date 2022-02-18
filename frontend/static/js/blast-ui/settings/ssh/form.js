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

const SshForm = class {

    constructor() {
        this._fd = undefined
        this.frame = `
            <form>
                <div class="row">
                    <div id="sshUsernameContainer" class="mb-2"></div>
                    <div id="sshPasswordContainer" class="mb-2"></div>
                    <div id="sshCertificateContainer" class="mb-2"></div>
                    <div id="sshLocationContainer" class="mb-2"></div>
                </div>
            </form>
        `
        this.inputSshUsername = `
            <label for="sshUsername" class="form-label">SSH username</label>
            <input id="sshUsername" name="sshUsername" type="text" class="form-control"/>
            <div id="sshUsernameHelp" class="form-text">Define the SSH username to run scripts.</div>
        `
        this.inputSshPassword = `
            <label for="sshPassword" class="form-label">SSH password</label>
            <input id="sshPassword" name="sshPassword" type="password" class="form-control" />
            <!-- <div id="sshPasswordHelp" class="form-text">Define the SSH password of the SSH username.</div> -->
            <div id="sshPasswordHelp">
                <input class="form-check-input" type="checkbox" value="" id="sshPasswordSet" disabled>
                <label class="form-check-label" for="sshPasswordSet">SSH Password set</label>
            </div>
        `
        this.inputSshCertificate = `
            <label for="sshCertificate" class="form-label">SSH certificate</label>
            <input type="file" name="sshCertificate" class="form-control" id="inputGroupSsh">
            <!-- <div id="sshCertificateHelp" class="form-text">Upload the SSH certificate of the SSH username.</div> -->
            <div id="sshCertificateHelp">
                <input class="form-check-input" type="checkbox" value="" id="sshCertificateSet" disabled>
                <label class="form-check-label" for="sshCertificateSet">SSH Certificate set</label>
            </div>
        `
        this.inputSshLocation = `
            <label for="sshLocation" class="form-label">SSH location</label>
            <input id="sshLocation" name="sshLocation" type="text" class="form-control" />
            <div id="sshLocationHelp" class="form-text">Define the SSH location for SSH connection.</div>
        `
        this._parentName = undefined

    }

    set parentName(pn) { this._pn = pn }
    set formData(fd) { this._fd = fd }

    get parentName() { return this._pn }
    get formData() { return this._fd }

    setFormData = () => {
        this.formData = { }
    }

    addFrame = () => {
        $("#" + this.parentName).html(this.frame)
    }

    addForm = () => {
        this.addFrame()
        $("#sshUsernameContainer").html(this.inputSshUsername)
        $("#sshPasswordContainer").html(this.inputSshPassword)
        $("#sshCertificateContainer").html(this.inputSshCertificate)
        $("#sshLocationContainer").html(this.inputSshLocation)
        // Assign SSH setting values directly from the cookie
        let ssh = JSON.parse($.cookie('setting'))['ssh']
        console.log(ssh)
        $("#sshUsername").val(ssh["username"])
        $("#sshCertificate").val(ssh["certificate"])
        $("#sshLocation").val(ssh["location"])
        if (ssh["is_password_set"]) { $("#sshPasswordSet").prop("checked", true) }
        if (ssh["is_certificate_set"]) { $("#sshCertificateSet").prop("checked", true) }
    }

    render = (parentName) => {
        this.parentName = parentName
        this.addForm()
    }

}

export default SshForm