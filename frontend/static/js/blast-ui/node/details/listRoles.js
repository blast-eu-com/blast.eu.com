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

const NodeListRoles = class {

    constructor() {
        this._pn
    }

    set parentName(pn) { this._pn = pn }

    get parentName() { return this._pn }

    addListRoles = (node) => {
        let html = '<table class="table">'
        node.roles.forEach(function(role) {
        html = html  + '<tr>'
        $.each(role, function(idx, val) { html = html + '<td>' + val + '</td>' })
            html = html + '</tr>'
        })

        $("#" + this.parentName).html(html + "</table>")
        return true
    }

    render = (parentName, node) => {
        this.parentName = parentName
        this.addListRoles(node)
    }

}

export default NodeListRoles