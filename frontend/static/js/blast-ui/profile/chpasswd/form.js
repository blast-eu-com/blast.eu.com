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


const AccountPassword = class {

    constructor() {

        this._pn
        this.frame = `
            <form>
                <div class="row">
                    <div class="col-md-12 mb-2" id="AccountOldPassword"></div>
                    <div class="col-md-12 mb-2" id="AccountNewPasswordA"></div>
                    <div class="col-md-12 mb-2" id="AccountNewPasswordB"></div>
                    <div class="col-md-2">
                        <button class="btn btn-sm blast-btn" type="submit" onclick="changeAccountPassword();">Apply</button>
                    </div>
                </div>
            </form>
        `
        this.inputAccountOldPassword = `
            <label for="accountOldPassword" class="form-label">Current password</label>
            <input id="accountOldPassword" class="form-control" name="accountOldPassword" type="password"
                pattern=".{8,}" title="Eight or more characters." value=""/>
            <div id="accountOldPasswordHelp" class="form-text">Set your current password.</div>
        `

        this.inputAccountNewPasswordA = `
            <label for="accountNewPasswordA" class="form-label">New password</label>
            <input id="accountNewPasswordA" class="form-control" name="accountNewPasswordA" type="password"
                pattern=".{8,}" title="Eight or more characters." value=""/>
            <div id="accountNewPasswordAHelp" class="form-text">Set your new password.</div>
        `

        this.inputAccountNewPasswordB = `
            <label for="accountNewPasswordB" class="form-label">Confirm new password</label>
            <input id="accountNewPasswordB" class="form-control" name="accountNewPasswordB" type="password"
                pattern=".{8,}" title="Eight or more characters." value=""/>
            <div id="accountNewPasswordBHelp" class="form-text">Confirm your new password.</div>
        `

    }

    set parentName(pn) { this._pn = pn }
    get parentName() { return this._pn }

    addFrame = () => {
        $("#" + this.parentName).html(this.frame)
    }

    addForm = () => {
        this.addFrame()

        $("#AccountOldPassword").html(this.inputAccountOldPassword)
        $("#AccountNewPasswordA").html(this.inputAccountNewPasswordA)
        $("#AccountNewPasswordB").html(this.inputAccountNewPasswordB)

    }

    render = (parentName) => {
        this.parentName = parentName
        this.addForm()
    }



}


export default AccountPassword