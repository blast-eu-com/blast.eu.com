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


const infrastructureListInfo = class {

    constructor() { }

    addListInfo = (infrastructure) => {
        let html = `
        <img style="margin-left: 1rem" src="/img/object/infrastructure.svg" width="56" height="56" />
        <table class="table"><thead></thead><tr><td><b>Infrastructure id</b></td><td>` + infrastructure.id + `</td></tr>`
        $.each(infrastructure.rawData, function(idx, val) {
            if ( idx !== "clusters" ) { html = html + '<tr><td><b>' + idx.charAt(0).toUpperCase() + idx.slice(1) + '</b></td><td>' + val + '</td></tr>' }
        })
        $("#" + this.parentName).html(html + '</table>')
    }

    render = (parentName, infrastructure) => {
        this.parentName = parentName
        this.addListInfo(infrastructure)
    }

}

export default infrastructureListInfo