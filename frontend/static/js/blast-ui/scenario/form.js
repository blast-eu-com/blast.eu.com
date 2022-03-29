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


const ScenarioForm = class {

    constructor(parentName) {
        this.parentName = parentName
        this._fd = undefined

        this.frame = `
            <div class="row mb-3">
                <div id="scenarioNameContainer" class="col-md-6"></div>
                <div id="scenarioDescriptionContainer" class="col-md-6"></div>
            </div>
            <div class="row mb-3">
                <div id="scenarioParallelModeContainer" class="col-md-6">
                    <input type="checkbox" id="ScenarioParallelMode" name="ScenarioParallelMode" /> Parallel Mode
                    <div id="scenarioParallelHelp" class="form-text">Check if the scenario should run the scripts selected in parallel.</div>
                </div>
                <div id="scenarioParallelThreadContainer" class="col-md-6"></div>
            </div>
            <div class="row mb-3">
                <div class="col-md-12">
                    <div id="managementUIScriptFrame" class="card-text"></div>
                </div>
            </div>
        `

        this.inputScenarioName = `
            <label for="scenarioName" class="form-label">Scenario Name</label>
            <input id="scenarioName" type="text" name="scenarioName" required pattern="([^ ]){6,}" class="form-control" />
            <div id="scenarioNameHelp" class="form-text">Give a name to your new scenario.</div>
        `

        this.inputScenarioDescription = `
            <label for="scenarioDescription" class="form-label">Scenario Description</label>
            <input id="scenarioDescription" type="text" name="scenarioDescription" required class="form-control" />
            <div id="scenarioDescriptionHelp" class="form-text">Describe this new scenario in a few words.</div>
        `

        this.inputScenarioParallelMode = `
            <input type="checkbox" id="scenarioParallelMode" name="scenarioParallelMode" /> Parallel Mode
            <div id="scenarioParallelHelp" class="form-text">Check if the scenario should run the scripts selected in parallel.</div>
        `

        this.inputScenarioParallelThread = `
            <label for="maxParallelThread" class="form-label">Max Parallel Threads</label>
            <input id="maxParallelThread" type="text" name="maxParallelThread" required class="form-control" />
            <div id="maxParallelThreadHelp" class="form-text">Provide the max parrallel script threads value for this scenario.</div>
        `
    }

    set formData(fd) { this._fd = fd }
    get formData() { return this._fd }

    addForm = () => {
        $("#scenarioNameContainer").html(this.inputScenarioName)
        $("#scenarioDescriptionContainer").html(this.inputScenarioDescription)
        $("#scenarioParallelModeContainer").html(this.inputScenarioParallelMode)
        $("#scenarioParallelThreadContainer").html(this.inputScenarioParallelThread)
    }

    addFrame = () => {
        $("#" + this.parentName).html(this.frame)
        this.addForm()
    }

    setFormData = async () => {
        this.formData = {
            "name": $("#scenarioName").val(),
            "description": $("#scenarioDescription").val(),
            "flag_parallel_mode": $("#scenarioParallelMode").is(":checked") ? true : false,
            "max_parallel_thread": $("#maxParallelThread").val()
        }
    }

    render = () => {
        this.addFrame()
    }
}


export default ScenarioForm