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

import Cluster from '../../cluster.js'

var cluster = new Cluster()

const ClusterForm = class {

    constructor() {
        this._fd = undefined
        this.frame = `
        <form>
            <div class="row">
                <div id="clusterNameContainer" class="col-md-6"></div>
                <div id="clusterDescriptionContainer" class="col-md-6"></div>
            </div>
        </form>
        `
        this.inputClusterName = `
            <label for="cluName" class="form-label">Cluster Name</label>
            <input id="cluName" type="text" name="cluName" required pattern="\w+" class="form-control" />
            <div id="clusterNameHelp" class="form-text">Give a name to your new cluster.</div>
        `
        this.inputClusterDescription = `
            <label for="cluDesc" class="form-label">Cluster Description</label>
            <input id="cluDesc" type="text" name="cluDesc" required class="form-control" />
            <div id="clusterDescHelp" class="form-text">Describe your new cluster in a few words.</div>
        `
        this._parentName = undefined

    }

    set formData(data) { this._fd = data }
    set parentName(pn) { this._parentName = pn }

    get formData() { return this._fd }
    get parentName() { return this._parentName }

    setFormData = () => {
        this.formData = {
            "name":  $('input[name=cluName]').val(),
            "description": $('input[name=cluDesc]').val()
        }
    }

    addCluster = () => {
        this.setFormData()
        cluster.add([this.formData]).then((Resp) => {
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
        this.addFrame()
        $("#clusterNameContainer").html(this.inputClusterName)
        $("#clusterDescriptionContainer").html(this.inputClusterDescription)
    }

    render = (parentName) => {
        this.parentName = parentName
        this.addForm()
    }

}

export default ClusterForm