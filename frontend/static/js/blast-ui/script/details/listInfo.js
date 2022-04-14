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



const ScriptListInfo = class {

    constructor()  { }

    addListInfo = (script) => {
        console.log(script)
        let html = `
            <table style="margin-top: 1rem" class="table">
            <tr><td>script id</td><td>` + script.id + `</td></tr>
        `
        $.each(script.rawData, function(idx, val) {
            if ( idx !== 'content') { html = html + '<tr><td>' + idx + '</td><td>' + val + '</td></tr>' }
        })
        $("#" + this.parentName).html(html + '</table>')
    }


    render = (parentName, script) => {
        this.parentName = parentName
        this.addListInfo(script)
    }

}


export default ScriptListInfo