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

let SideBar = class {

    constructor() {

        this.frame = `
            <style>
            body {
                overflow-y: scroll;
                overflow-x: hidden;
            }
            .item-active { 
                background-color: #FFE873;
            }
            .nav-item:not(.item-active):hover {
                background-color: #FFE873;
            }
            </style>
            <ul id="slide-out" class="nav blast-nav-background flex-column">
                <li class="nav-item p-2 pl-3" id="cluster">
                    <a class="nav-link text-decoration-none font-weight-normal" style="color: black"
                       href="/html/cluster.html" onclick="activeSideBarMenu('cluster')">
                    <img src="/img/object/cluster.svg" height="24" width="24" class="d-inline-block align-middle mr-4" />
                    Cluster</a></li>
                <!-- <li class="nav-item item-active p-2 pl-3" id="dashboard">
                    <a class="nav-link text-decoration-none font-weight-normal" style="color: black" 
                       href="/html/dashboard.html" onclick="activeSideBarMenu('dashboard')">
                    <img src="/img/object/dashboard.svg" height="24" width="24" class="d-inline-block align-middle mr-4" />
                    Dashboard</a></li>
                -->
                <li class="nav-item p-2 pl-3" id="infrastructure">
                    <a class="nav-link text-decoration-none font-weight-normal" style="color: black"
                       href="/html/infrastructure.html" onclick="activeSideBarMenu('infrastructure')">
                    <img src="/img/object/infrastructure.svg" height="24" width="24" class="d-inline-block align-middle mr-4" />
                    Infrastructure</a></li>
                <li class="nav-item p-2 pl-3" id="node">
                    <a class="nav-link text-decoration-none font-weight-normal" style="color: black" 
                       href="/html/node.html" onclick="activeSideBarMenu('node')">
                    <img src="/img/object/node.svg" height="24" width="24" class="d-inline-block align-middle mr-4" />
                    Node</a></li>
                <li class="nav-item p-2 pl-3" id="realm">
                    <a class="nav-link text-decoration-none font-weight-normal" style="color: black"
                       href="/html/realm.html" onclick="activeSideBarMenu('realm')">
                    <img src="/img/object/realm.svg" height="24" width="24" class="d-inline-block align-middle mr-4" />
                    Realm</a></li>
                <li class="nav-item p-2 pl-3" id="report">
                    <a class="nav-link text-decoration-none font-weight-normal" style="color: black"
                       href="/html/report.html" onclick="activeSideBarMenu('realm')">
                    <img src="/img/object/report.svg" height="24" width="24" class="d-inline-block align-middle mr-4" />
                    Report</a></li>
                <li class="nav-item p-2 pl-3" id="scenario">
                    <a class="nav-link text-decoration-none font-weight-normal" style="color: black"
                       href="/html/scenario.html" onclick="activeSideBarMenu('scenario')">
                    <img src="/img/object/scenario.svg" height="24" width="24" class="d-inline-block align-middle mr-4" />
                    Scenario</a></li>
                <li class="nav-item p-2 pl-3" id="scheduler">
                    <a class="nav-link text-decoration-none font-weight-normal" style="color: black"
                        href="/html/scheduler.html" onclick="activeSideBarMenu('scheduler')">
                    <img src="/img/bootstrap-icons/calendar2-week-fill.svg" height="24" width="24" class="d-inline-block align-middle mr-4" />
                    Scheduler</a></li>
                <li class="nav-item p-2 pl-3" id="script">
                    <a class="nav-link text-decoration-none font-weight-normal" style="color: black"
                       href="/html/script.html" onclick="activeSideBarMenu('script')" >
                    <img src="/img/bootstrap-icons/file-code.svg" height="24" width="24" class="d-inline-block align-middle mr-4" />
                    Script</a></li>
                <li class="nav-item p-2 pl-3" id="settings">
                    <a class="nav-link text-decoration-none font-weight-normal" style="color: black" 
                       href="/html/settings.html" onclick="activeSideBarMenu('settings')" >
                    <img src="/img/bootstrap-icons/sliders.svg" height="24" width="24" class="d-inline-block align-middle mr-4" />
                    Settings</a></li>
            </ul>    
            `
    }

    load = (pageName) => {
        $("#side_nav_container").html(this.frame)
        if (pageName !== 'home') {
            $("li").removeClass("active")
            $("li").removeClass("item-active")
            $("li#" + pageName).addClass("active")
            $("li#" + pageName).addClass("item-active")
        }
    }

    render = (pageName) => {
        this.load(pageName)
    }

    activeSideBarMenu = (pageName) => {
        $("li").removeClass("active")
        $("li").removeClass("item-active")
        $("li#" + pageName).addClass("active")
        $("li#" + pageName).addClass("item-active")
    }

}

export default SideBar
