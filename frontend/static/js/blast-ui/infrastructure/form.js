/*
   Copyright 2020 Jerome DE LUCCHI

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

import Infrastructure from '../../infrastructure.js'

var infrastructure = new Infrastructure()

const InfrastructureForm = class {

    constructor() {
        this._formData = {}

        this.frame = `
        <form>
            <div class="row">
                <div id="infrastructureNameContainer" class="col-md-6"></div>
                <div id="infrastructureDescriptionContainer" class="col-md-6"></div>
            </div>
        </form>
        `
        this.inputInfrastructureName = `
            <label for="infraName" class="form-label">Infrastructure Name</label>
            <input id="infraName" type="text" name="infraName" required pattern="\w+" class="form-control" />
            <div id="infraNameHelp" class="form-text">Give a name to your new infrastructure.</div>
        `
        this.inputInfrastructureDescription = `
            <label for="infraDesc" class="form-label">Infrastructure Description</label>
            <input id="infraDesc" type="text" name="infraDesc" required class="form-control" />
            <div id="infraDescHelp" class="form-text">Describe your new infrastructure in a few words.</div>
        `

    }

    set formData(data) { this._formData = data }
    get formData() { return this._formData }

    setFormData = () => {
        this.formData = {
            "name":  $('input[name=infraName]').val(),
            "description": $('input[name=infraDesc]').val()
        }
    }

    addInfrastructure = () => {
        this.setFormData()
        infrastructure.add([this.formData]).then((Resp) => {
            for ( let idx in Resp ) {
                if ( Resp[idx]["result"] === "created" ) {
                    location.reload()
                }
            }
        })
    }

    addFrame = () => {
        $("#" + this.parentName).html(this.frame)
    }

    addForm = () => {
        $("#infrastructureNameContainer").html(this.inputInfrastructureName)
        $("#infrastructureDescriptionContainer").html(this.inputInfrastructureDescription)
    }

    render = (parentName) => {
        this.parentName = parentName
        this.addFrame()
        this.addForm()
    }

}

export default InfrastructureForm