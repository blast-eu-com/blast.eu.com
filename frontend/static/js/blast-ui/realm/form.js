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

import Realm from '../../realm.js'
import Toast from '../main/notification/toast.js'
import {dictionary} from '../main/message/en/dictionary.js'
var realm = new Realm()
var toast = new Toast()
toast.msgPicture = '../../../img/object/realm.svg'


const RealmForm = class {

    constructor() {

        this._formData = undefined

        this.frame = `
            <form>
                <div class="row">
                    <div id="realmNameContainer" class="col-md-6"></div>
                    <div id="realmDescriptionContainer" class="col-md-6"></div>
                </div>
            </form>
        `
        this.inputRealmName = `
             <label for="realmName" class="form-label">Realm Name</label>
             <input id="realmName" type="text" name="realmName" class="form-control">
             <div id="realmNameHelp" class="form-text">Give a name to your new realm.</div>
        `
        this.inputRealmDescription = `
            <label for="realmDesc" class="form-label">Realm Description</label>
            <input id="realmDesc" type="text" name="realmDesc" class="form-control"/>
            <div id="realmDescHelp" class="form-text">Describe your new realm in a few words.</div>
        `

    }

    set formData(data) { this._formData = data }
    get formData() { return this._formData }

    setFormData = () => {
        this.formData = {
            "name": $("#realmName").val(),
            "description": $("#realmDesc").val()
        }
    }

    addFrame = () => {
        $("#" + this.parentName).html(this.frame)
    }

    addForm = () => {
        $("#realmNameContainer").html(this.inputRealmName)
        $("#realmDescriptionContainer").html(this.inputRealmDescription)
    }

    addRealm = async () => {
        this.setFormData()
        let actionRes, realmData = this.formData
        realm.add(realmData).then((Resp) => {
            if ( Resp["result"] === "created" ) {
                toast.msgTitle = "Realm create Success"
                toast.msgText = dictionary["realm"]["add"].replace('%realmName%', realmData["name"])
                actionRes = "success"
            } else if ( Object.keys(Resp).includes("failure") ) {
                toast.msgTitle = "Realm create Failure"
                toast.msgText = Resp["failure"]
                actionRes = "failure"
            }
            toast.notify(actionRes)
            setTimeout(() => { location.reload() }, 2000)
        })
    }


    render = (parentName) => {
        this.parentName = parentName
        this.addFrame()
        this.addForm()
    }

}

export default RealmForm