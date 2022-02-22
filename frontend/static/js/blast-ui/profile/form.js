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

var config = new FrontendConfig()

const ProfileForm = class {

    constructor() {
        this._pn
        this.frame = `
            <form>
                <div class="row">
                    <div id="profilePicture" class="col-md-12 mb-2"></div>
                    <div id="profileFirstName" class="col-md-6 mb-2"></div>
                    <div id="profileFamilyName" class="col-md-6 mb-2"></div>
                    <div id="profileEmail" class="col-md-12 mb-2"></div>
                    <div id="profileChangePassword" class="col-md-12 mb-2"></div>
                    <div class="col-md-2 mt-4">
                        <button class="btn btn-sm blast-btn" onclick="updateProfile();">Update</button>
                    </div>
                </div>
            </form>
        `

        this.inputProfilePicture = `
            <p><img id="accountPicture" src="" height="128" width="128" /></p>
            <input type="file" id="accountPicture" name="accountPicture" accept="image/png"/>
        `

        this.inputProfileFirstName = `
            <label for="accountFirstName" class="form-label">First name</label>
            <input id="accountFirstName" class="form-control" name="accountFirstName" type="text" value=""/>
            <div id="accountFirstNameHelp" class="form-text">Set your first name.</div>
        `

        this.inputProfileFamilyName = `
            <label for="accountFamilyName" class="form-label">Family name</label>
            <input id="accountFamilyName" class="form-control" name="accountFamilyName" type="text" value=""/>
            <div id="accountFamilyNameHelp" class="form-text">Set your family name.</div>
        `

        this.inputProfileEmail = `
            <label for="accountEmail" class="form-label">Email</label>
            <input id="accountEmail" class="form-control" name="accountEmail" type="text" value=""/>
            <div id="accountEmailHelp" class="form-text">Set your email address.</div>
        `

        this.linkChangePassword = `
            <a href="/html/profile-chpasswd.html"><u>Change password</u></a>
        `



    }

    set parentName(pn) { this._pn = pn }

    get parentName() { return this._pn }

    addFrame = () => {
        $("#" + this.parentName).html(this.frame)
    }

    addForm = () => {
        this.addFrame()

        $("#profilePicture").html(this.inputProfilePicture)
        $("img#accountPicture").attr("src", config.frontend.httpImgFolder + '/profile/' + config.session.accountPicture)

        $("#profileFirstName").html(this.inputProfileFirstName)
        $("#accountFirstName").val(config.session.accountFirstName)

        $("#profileFamilyName").html(this.inputProfileFamilyName)
        $("#accountFamilyName").val(config.session.accountFamilyName)

        $("#profileEmail").html(this.inputProfileEmail)
        $("#accountEmail").val(config.session.accountEmail)

        $("#profileChangePassword").html(this.linkChangePassword)

    }

    render = (parentName) => {
        this.parentName = parentName
        this.addForm()

    }

}


export default ProfileForm