/*
 *   Copyright 2022 Jerome DE LUCCHI
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
*/


const ScenarioListInfo = class {

    constructor() {
        this._pn
    }

    set parentName(pn) { this._pn = pn }

    get parentName() { return this._pn }

    addListInfo = (scenario) => {

        let html = `
            <table class="table">
            <tr><td>id</td><td>` + scenario.id + `</td></tr>`

        $.each(scenario.rawData, (key, val) => {
            if ( key === 'nodes' || key === 'scripts' ) {
                let objValue = ''
                val.forEach((value) => {
                    objValue = objValue + `
                    <a href="/html/` + key.slice(0, -1) + `-details.html?id=` + value + `">
                    <span class="badge blast-badge">` + value + `</span>
                    </a>`
                })
                html = html + '<tr><td>' + key + '</td><td>' + objValue + '</td></tr>'
            } else {
                html = html + '<tr><td>' + key + '</td><td>' + val + '</td></tr>'
            }
        })

        $("#" + this.parentName).html(html + '</table>')
    }

    render = (parentName, scenario) => {
        this.parentName = parentName
        this.addListInfo(scenario)
    }
}


export default ScenarioListInfo