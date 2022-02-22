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

import RequestListInfo from "./listInfo.js"
import Request from "../../../request.js"
import Toast from '../../main/notification/toast.js'
import {dictionary} from '../../main/message/en/dictionary.js'

var requestListInfo = new RequestListInfo()
var request = new Request()
var toast = new Toast()

toast.msgPicture = "../../../img/object/request.svg"

const acceptRequest = function(request_id) {
    let actionRes
    request.execUserAction("accept", request_id).then(function(Resp) {
        if ( Resp["result"] === "updated" ) {
            toast.msgTitle = "Request accept Success"
            toast.msgText = dictionary["request"]["accept"].replace('%requestName%', request_id)
            actionRes = "success"
        } else if ( Object.keys(Resp).includes("failure") ) {
            toast.msgTitle = "Request accept Failure"
            toast.msgText = Resp["failure"]
            actionRes = "failure"
        }
        toast.notify(actionRes)
        setTimeout(() => { location.reload() }, 2000)
    })
}

const rejectRequest = function(request_id) {
    let actionRes
    request.execUserAction("reject", request_id).then(function(Resp) {
        if ( Resp["result"] === "updated" ) {
            toast.msgTitle = "Request reject Success"
            toast.msgText = dictionary["request"]["reject"].replace('%requestName%', request_id)
            actionRes = "success"
        } else if ( Object.keys(Resp).includes("failure") ) {
            toast.msgTitle = "Request reject Failure"
            toast.msgText = Resp["failure"]
            actionRes = "failure"
        }
        toast.notify(actionRes)
        setTimeout(() => { location.reload() }, 2000)
    })
}

const cancelRequest = function(request_id) {
    let actionRes
    request.execUserAction("cancel", request_id).then(function(Resp) {
        if ( Resp["result"] === "updated" ) {
            toast.msgTitle = "Request cancel Success"
            toast.msgText = dictionary["request"]["cancel"].replace('%requestName%', request_id)
            actionRes = "success"
        } else if ( Object.keys(Resp).includes("failure") ) {
            toast.msgTitle = "Request cancel Failure"
            toast.msgText = Resp["failure"]
            actionRes = "failure"
        }
        toast.notify(actionRes)
        setTimeout(() => { location.reload() }, 2000)
    })
}

const setPageTitle = function(request_id) {
    $("#navRequestId").html(request_id)
}

async function main() {
    let urlParams = new URLSearchParams(window.location.href.split('?')[1])
    if (urlParams.has("id")) {
        let request_id = urlParams.get('id')
        let request_data = await request.listById(request_id)
        console.log(request_data)
        request.load(request_data["hits"]["hits"][0])
        setPageTitle(request.id)
        requestListInfo.render('requestDetails', request)
    }

}

window.main = main
window.acceptRequest = acceptRequest
window.rejectRequest = rejectRequest
window.cancelRequest = cancelRequest