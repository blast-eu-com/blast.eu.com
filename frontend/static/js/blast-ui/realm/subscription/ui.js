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

import RealmSubscriptionForm from "./form.js"
import Request from "../../../request.js"
import FrontendConfig from '../../../frontend.js'

var realmSubscriptionForm = new RealmSubscriptionForm()
var request = new Request()
var config = new FrontendConfig()

const subscribeRealm = () => {
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
    request.add(requestData)
}

const setPageTitle = function(realmName) {
    $("#navRealmName").html(realmName)
}

function main() {
    let urlParams = new URLSearchParams(window.location.href.split('?')[1])
    if (urlParams.has("realm_name")) {
        let realmName = urlParams.get("realm_name")
        setPageTitle(realmName)
        realmSubscriptionForm.render("realmSubscriptionForm")
    }
}

window.main = main
window.subscribeRealm = subscribeRealm