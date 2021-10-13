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


class RealmSubscriptionForm {

    constructor() {
        this._pn = undefined
        this.frame = `
            <div id="MainRealmSubscriptionForm">
                <div id="RealmSubscriptionFormText"></div>
                <div id="RealmSubscriptionFormInput"></div>
                <div id="RealmSubscriptionFormButton"></div>
            </div>
        `
        this.FormText = `
            <p>You are not a member of this realm so you cannot access to this realm details. You can subscribe to
            this realm by clicking on the below button. Attention: your admission to the realm is not automatic, it
            must be approved by the owner of the realm.</p>
        `

        this.FormInputText = `
            <div>Add a comment to your request.</div>
            <textarea id="requestMessage" rows="4" cols="64"></textarea>
        `

        this.FormButton = `
            <div>
            <a type="button" class="btn blast-btn" onclick="subscribeRealm();">SUBSCRIBE</a>
            </div>
        `
    }

    set parentName(pn) { this._pn = pn }

    get parentName() { return this._pn }

    addFrame() {
        $("#" + this.parentName).html(this.frame)
    }

    addForm() {
        this.addFrame()
        $("#RealmSubscriptionFormText").html(this.FormText)
        $("#RealmSubscriptionFormInput").html(this.FormInputText)
        $("#RealmSubscriptionFormButton").html(this.FormButton)
    }

    render(parentName) {
        this.parentName = parentName
        this.addForm()
    }

}

export default RealmSubscriptionForm