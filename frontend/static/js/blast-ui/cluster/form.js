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

import Cluster from '../../cluster.js'
import Infrastructure from '../../infrastructure.js'
import Toast from '../main/notification/toast.js'
import {dictionary} from '../main/message/en/dictionary.js'
import FrontendConfig from '../../frontend.js'
var config = new FrontendConfig()
var cluster = new Cluster()
var toast = new Toast()
var infrastructure = new Infrastructure()
toast.msgPicture = '../../../img/object/cluster.svg'


const ClusterForm = class {

    constructor() {
        this._fd
        this._cn
        this._cd
        this._ci
        this.frame = `
        <form>
            <div class="row">
                <div id="clusterNameContainer" class="col-md-4"></div>
                <div id="clusterDescriptionContainer" class="col-md-4"></div>
                <div id="clusterInfrastructureContainer" class="col-md-4"></div>
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

        this.inputClusterInfrastructure = ``
        infrastructure.list(config.session.realm).then((infrastructures) => {
            if (infrastructures["hits"]["total"]["value"] > 0) {
                this.inputClusterInfrastructure = `
                    <label for="selectCluInfra" class="form-label">Cluster Infrastructure</label>
                    <select class="form-select" name="selectCluInfra" id="selectCluInfra">`
                infrastructures["hits"]["hits"].forEach((infraData) => {
                    this.inputClusterInfrastructure = this.inputClusterInfrastructure + `<option value="` + infraData["_id"] + `">` + infraData["_source"]["name"] + `</option>`
                })
                this.inputClusterInfrastructure = this.inputClusterInfrastructure + `</select><div class="form-text">Select the parent infrastructure for this cluster.</div>`
            }
        })

        this._parentName = undefined

    }

    set formData(data) { this._fd = data }
    set clusterName(cn) { this._cn = cn }
    set clusterDescription(cd) { this._cd = cd }
    set clusterInfrastructure(ci) { this._ci = ci }
    set parentName(pn) { this._parentName = pn }

    get formData() { return this._fd }
    get clusterName() { return this._cn }
    get clusterDescription() { return this._cd }
    get clusterInfrastructure() { return this._ci }
    get parentName() { return this._parentName }

    setFormData = () => {
        this.clusterName = $('input[name=cluName]').val()
        this.clusterDescription = $('input[name=cluDesc]').val()
        this.clusterInfrastructure = $("#selectCluInfra").length ? $('select[name="selectCluInfra"] option:selected').val() : ''
        this.formData = {
            "name": this.clusterName,
            "description": this.clusterDescription,
            "infrastructure": this.clusterInfrastructure
        }
    }

    addCluster = () => {
        this.setFormData()
        let actionRes, clusterData = this.formData
        cluster.add(clusterData).then((Resp) => {
            if ( Resp["result"] === "created" ) {
                toast.msgTitle = "Cluster create Success"
                toast.msgText = dictionary["cluster"]["add"].replace('%clusterName%', clusterData["name"])
                actionRes = "success"
            } else if ( Object.keys(Resp).includes("failure") ) {
                toast.msgTitle = "Cluster create Failure"
                toast.msgText = Resp["failure"]
                actionRes = "failure"
            }
            toast.notify(actionRes)
            setTimeout(() => { location.reload() }, 2000)
        })
    }

    addFrame = () => {
        $("#" + this.parentName).html(this.frame)
    }

    addForm = () => {
        this.addFrame()
        $("#clusterNameContainer").html(this.inputClusterName)
        $("#clusterDescriptionContainer").html(this.inputClusterDescription)
        $("#clusterInfrastructureContainer").html(this.inputClusterInfrastructure)
    }

    render = (parentName) => {
        console.log($("#selectClusterInfra"))
        this.parentName = parentName
        this.addForm()
    }

}

export default ClusterForm