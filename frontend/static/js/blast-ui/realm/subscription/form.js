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


import FrontendConfig from '../../../frontend.js'
import Request from "../../../request.js"
import Toast from '../../main/notification/toast.js'
import {dictionary} from '../../main/message/en/dictionary.js'
var config = new FrontendConfig()
var toast = new Toast()
var request = new Request()
toast.msgPicture = '../../../img/object/infrastructure.svg'


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
            <p>Read access permission denied. You can become a member of this realm by clicking on the subscribe button.
            Attention: your admission to the realm is not automatic, the owner of the realm must approve it.</p>
        `

        this.FormInputText = `
            <div>Add a comment to motivate your request.</div>
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

    subscribeRealm = () => {
        let requestData = {
            "object": "realm",
            "action": "subscribe",
            "message": $("#requestMessage").val(),
            "sender": config.session.accountEmail,
            "data": {
                "key": "realmName",
                "value": $("#navRealmName").html()
            }
        }
        request.add(requestData).then((Resp) => {
            let actionRes
            if ( Resp["result"] === "created" ) {
                toast.msgTitle = "Request create Success"
                toast.msgText = dictionary["request"]["add"].replace('%requestName%', requestData["data"]["value"])
                actionRes = "success"
            } else if ( Object.keys(Resp).includes("failure") ) {
                toast.msgTitle = "Request create Failure"
                toast.msgText = Resp["failure"]
                actionRes = "failure"
            }

            toast.notify(actionRes)
            setTimeout(() => { location.reload() }, 2000)
        })
    }

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