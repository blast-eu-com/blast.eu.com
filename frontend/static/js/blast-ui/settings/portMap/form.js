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

import PortMap from '../../../port-map.js'
import Toast from '../../main/notification/toast.js'
import {dictionary} from '../../main/message/en/dictionary.js'

var portMap = new PortMap()
var toast = new Toast()

const PortMapForm = class {

    constructor() { }

    templatePortMap = (portMapData) => {
        let html = `<table class="table table-sm" style="font-size: small"><thead><th>Service name</th><th>Port</th><th>Protocol</th><th>Description</th></thead>`
        portMapData.forEach((pmap) => {
            html = html + `
                <tr>
                <td id="service-name-` + pmap["_id"] + `">` + pmap["_source"]["service_name"] + `</td>
                <td id="port-` + pmap["_id"] + `">` + pmap["_source"]["port"] + `</td>
                <td id="protocol-` + pmap["_id"] + `">` + pmap["_source"]["protocol"] + `</td>
                <td id="description-` + pmap["_id"] + `">` + pmap["_source"]["description"] + `</td>
                <td><button id="modify-btn-` + pmap["_id"] + `" type="button" class="blast-btn btn btn-sm" onclick="modifyPortMap('` + pmap["_id"]+ `') ;">Modify</button></td>
                <td><button id="save-btn-` + pmap["_id"] + `" type="button" class="blast-btn btn btn-sm disabled" onclick="savePortMap('` + pmap["_id"] + `') ;">Save</button></td>
                <td><button id="cancel-btn-` + pmap["_id"] + `" type="button" class="blast-btn btn btn-sm disabled" onclick="cancelPortMap('` + pmap["_id"]+ `') ;">Cancel</button></td>
                </tr>`
        })
        return html
    }

    loadPortMap = () => {
        portMap.list().then((portMapData) => {
            $("#PortMapListPagination").pagination({
                dataSource: portMapData["hits"]["hits"],
                pageSize: 250,
                callback: (data, pagination) => {
                    let html = this.templatePortMap(data)
                    $("#PortMapList").html(html)
                }
            })
        })
    }

    modify = (portMapId) => {
        let serviceName = $("#service-name-" + portMapId).html()
        let port = $("#port-" + portMapId).html()
        let protocol = $("#protocol-" + portMapId).html()
        let description = $("#description-" + portMapId).html()

        let inputServiceName = `<input type="text" id="input-service-name-` + portMapId + `" value="` + serviceName + `"/>`
        let inputPort = `<input type="text" id="input-port-` + portMapId + `" value="` + port + `" />`
        let inputProtocol = `<input type="text" id="input-protocol-` + portMapId+ `" value="` + protocol+ `" />`
        let inputDescription = `<input type="text" id="input-description-` + portMapId +`" value="` + description + `" />`

        $("#service-name-" + portMapId).html(inputServiceName)
        $("#port-" + portMapId).html(inputPort)
        $("#protocol-" + portMapId).html(inputProtocol)
        $("#description-" + portMapId).html(inputDescription)

        if ( ! $("#modify-btn-" + portMapId).hasClass("disabled") ) {
            $("#modify-btn-" + portMapId).addClass("disabled")
        }

        if ( $("#save-btn-" + portMapId).hasClass("disabled") ) {
            $("#save-btn-" + portMapId).removeClass("disabled")
        }

        if ( $("#cancel-btn-" + portMapId).hasClass("disabled") ) {
            $("#cancel-btn-" + portMapId).removeClass("disabled")
        }
    }

    save = (portMapId) => {
        let serviceName = $("#input-service-name-" + portMapId).val()
        let port = $("#input-port-" + portMapId).val()
        let protocol = $("#input-protocol-" + portMapId).val()
        let description = $("#input-description-" + portMapId).val()
        let portMapData = {
            "service_name": serviceName,
            "port": port,
            "protocol": protocol,
            "description": description
        }
        portMap.update(portMapId, portMapData).then((Resp) => {
            if ( Resp["result"] == "updated") {
                console.log("do something")
            }
        })
    }

    cancel = (portMapId) => {
        let serviceName = $("#input-service-name-" + portMapId).val()
        let port = $("#input-port-" + portMapId).val()
        let protocol = $("#input-protocol-" + portMapId).val()
        let description = $("#input-description-" + portMapId).val()

        $("#service-name-" + portMapId).html(serviceName)
        $("#port-" + portMapId).html(port)
        $("#protocol-" + portMapId).html(protocol)
        $("#description-" + portMapId).html(description)

        if ( $("#modify-btn-" + portMapId).hasClass("disabled") ) {
            $("#modify-btn-" + portMapId).removeClass("disabled")
        }

        if ( ! $("#save-btn-" + portMapId).hasClass("disabled") ) {
            $("#save-btn-" + portMapId).addClass("disabled")
        }

        if ( ! $("#cancel-btn-" + portMapId).hasClass("disabled") ) {
            $("#cancel-btn-" + portMapId).addClass("disabled")
        }

    }

    render() {
        this.loadPortMap()
    }

}

export default PortMapForm


