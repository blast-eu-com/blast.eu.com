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

// we need to make sure the user have jwt cookie before to continue
import Realm from "./realm.js";
import Account from "./aaa.js"
import FrontendConfig from "./frontend.js"
let realm = new Realm()
let account = new Account()
let config = new FrontendConfig()



let Nav = class {

    constructor() {

        this.navbar = `
            <style>
                li#navDropDown:hover { background-color: rgba(0,0,0,0) ; }
            </style>
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <!-- <nav class="navbar navbar-expand-lg navbar-dark" style="background-color: #306998"> -->
                <a class="navbar-brand" style="width: 201px; text-align: center;">
                    <img src="/img/blast_header_yellow.ico" width="120" height="40" class="d-inline-block align-bottom"/>
                </a>
                <div class="dropdown p-1 mx-3" style="border-left: thin solid gray; border-right: thin solid gray;">
                    <img id="dropDownProfileMenuLink" data-toggle="dropdown" role="button"
                         style="margin-left: 10px; margin-right: 10px;"
                         src="" width="36" height="36" />
                    <div class="dropdown-menu mr-3 mt-2 bg-dark" style="border: 1px solid black; z-index: 1001" aria-labelledby="dropDownProfileMenuLink">
                        <a class="dropdown-item bg-dark text-light" href="/html/profile.html">
                            <img src="/img/object/profile.svg" width="24" height="24" /><span style="margin-left: 24px">Profile</span></a>
                        <a class="dropdown-item bg-dark text-light" href="/html/profile.html">
                            <img src="/img/object/email.svg" width="24" height="24" /><span style="margin-left: 24px">Notification</span></a>
                        <div class="dropdown-divider seconday"></div>
                        <a id="userAccountLogout" class="dropdown-item bg-dark text-light" href="/html/logout.html">
                            <img src="/img/object/logout.svg" width="24" height="24" /><span style="margin-left: 24px">Logout</span></a>
                    </div>
                </div>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav">
                        <li id="navDropDown" class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" id="realmDropDownMenu" role="button" 
                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></a>
                            <div class="dropdown-menu mt-2" id="navRealmDropDownMenu" aria-labelledby="navbarDropdown"
                                 style="height: 150px; overflow-y: scroll"></div>
                        </li>
                    </ul>     
                </div>
                <!--
                <form class="form-inline mr-5 ml-3">
                    <div class="input-group">
                        <input class="form-control" size="64" type="search" />
                        <div class="input-group-append">
                            <button class="btn" style="background-color: #FFE873" onclick="globalSearch() ;"><b>Search</b></button>
                        </div>
                    </div>
                </form>
                -->
            </nav>
            `

        this.sidenav = `
            <style>
            body {
                overflow-y: scroll;
                overflow-x: hidden;
            }
            .item-active { 
                /* background-color: rgba(0,0,0,.125); */
                background-color: #FFE873;
                // border-right: 1px solid black;
            }
            .nav-item:not(.item-active):hover {
                /* background-color: #e9ecef; */
                background-color: #FFE873;
                // border-right: 1px solid black;
            }
            </style>
            <ul id="slide-out" class="nav blast-nav-background flex-column">
                <li class="nav-item p-2 pl-3" id="cluster">
                    <a class="nav-link text-decoration-none font-weight-normal" style="color: black"
                       href="/html/cluster.html" onclick="sideNavActiveMenu('cluster')">
                    <img src="/img/object/cluster.svg" height="24" width="24" class="d-inline-block align-middle mr-4" />
                    Cluster</a></li>
                <li class="nav-item item-active p-2 pl-3" id="dashboard">
                    <a class="nav-link text-decoration-none font-weight-normal" style="color: black" 
                       href="/html/dashboard.html" onclick="sideNavActiveMenu('dashboard')">
                    <img src="/img/object/dashboard.svg" height="24" width="24" class="d-inline-block align-middle mr-4" />
                    Dashboard</a></li>
                <li class="nav-item p-2 pl-3" id="infrastructure">
                    <a class="nav-link text-decoration-none font-weight-normal" style="color: black"
                       href="/html/infrastructure.html" onclick="sideNavActiveMenu('infrastructure')">
                    <img src="/img/object/infrastructure.svg" height="24" width="24" class="d-inline-block align-middle mr-4" />
                    Infrastructure</a></li>
                <li class="nav-item p-2 pl-3" id="node">
                    <a class="nav-link text-decoration-none font-weight-normal" style="color: black" 
                       href="/html/node.html" onclick="sideNavActiveMenu('node')">
                    <img src="/img/object/node.svg" height="24" width="24" class="d-inline-block align-middle mr-4" />
                    Node</a></li>
                <li class="nav-item p-2 pl-3" id="realm">
                    <a class="nav-link text-decoration-none font-weight-normal" style="color: black"
                       href="/html/realm.html" onclick="sideNavActiveMenu('realm')">
                    <img src="/img/object/realm.svg" height="24" width="24" class="d-inline-block align-middle mr-4" />
                    Realm</a></li>
                <li class="nav-item p-2 pl-3" id="report">
                    <a class="nav-link text-decoration-none font-weight-normal" style="color: black"
                       href="/html/report.html" onclick="sideNavActiveMenu('realm')">
                    <img src="/img/object/report.svg" height="24" width="24" class="d-inline-block align-middle mr-4" />
                    Report</a></li>
                <li class="nav-item p-2 pl-3" id="scenario">
                    <a class="nav-link text-decoration-none font-weight-normal" style="color: black"
                       href="/html/scenario.html" onclick="sideNavActiveMenu('scenario')">
                    <img src="/img/object/management.svg" height="24" width="24" class="d-inline-block align-middle mr-4" />
                    Scenario</a></li>
                <li class="nav-item p-2 pl-3" id="scheduler">
                    <a class="nav-link text-decoration-none font-weight-normal" style="color: black"
                        href="/html/scheduler.html" onclick="sideNavActiveMenu('scheduler')">
                    <img src="/img/bootstrap-icons/calendar2-week-fill.svg" height="24" width="24" class="d-inline-block align-middle mr-4" />
                    Scheduler</a></li>
                <li class="nav-item p-2 pl-3" id="script">
                    <a class="nav-link text-decoration-none font-weight-normal" style="color: black"
                       href="/html/script.html" onclick="sideNavActiveMenu('script')" >
                    <img src="/img/bootstrap-icons/file-code.svg" height="24" width="24" class="d-inline-block align-middle mr-4" />
                    Script</a></li>
                <li class="nav-item p-2 pl-3" id="settings">
                    <a class="nav-link text-decoration-none font-weight-normal" style="color: black" 
                       href="/html/settings.html" onclick="sideNavActiveMenu('settings')" >
                    <img src="/img/bootstrap-icons/sliders.svg" height="24" width="24" class="d-inline-block align-middle mr-4" />
                    Settings</a></li>
            </ul>    
            `
    }

    loadSideNav(pageName) {
        $("#side_nav_container").html(this.sidenav)
        if (pageName !== 'home') {
            $("li").removeClass("active")
            $("li").removeClass("item-active")
            $("li#" + pageName).addClass("active")
            $("li#" + pageName).addClass("item-active")
        }
    }

    loadNavBarProfilePicture() {
        let accountPicture = (Object.keys(JSON.parse($.cookie("account"))).includes("picture")) ? JSON.parse($.cookie("account"))["picture"] : ""
        window.parent.$("img#dropDownProfileMenuLink").prop("src", config.frontend.httpImgFolder + '/profile/' + accountPicture)
    }

    loadNavBar() {

        let html = ''
        let realmName = JSON.parse($.cookie("realm"))["name"]
        $("#nav_container").html(this.navbar)
        this.loadNavBarProfilePicture()
        $("#realmDropDownMenu").html(realmName)

        realm.list().then(function(realmData) {
            if ( realmData["hits"]["total"]["value"] > 0 ) {
                realmData["hits"]["hits"].forEach(function(data) {
                    if ( realmName !== data["_source"]["name"] ) {
                        html = html + `<a class="dropdown-item" onclick="navRealmSwitch('` + data["_source"]["name"] + `')">` + data["_source"]["name"] + `</a>`
                        $("#navRealmDropDownMenu").html(html)
                    }
                })
            }
        })
    }

    loadNavBars(pageName) {
        this.loadSideNav(pageName)
        this.loadNavBar()
    }

    pagePreload() {
        document.onreadystatechange = function() {
            if (document.readyState !== 'complete' ) {
                document.querySelector('body').style.visibility = 'hidden' ;
            } else if ( document.readyState === 'complete' ) {
                document.querySelector('body').style.visibility = 'visible'
            }
        }
    }

}

let nav = new Nav()

const sideNavActiveMenu = function(pageName) {
    $("li").removeClass("active")
    $("li").removeClass("item-active")
    $("li#" + pageName).addClass("active")
    $("li#" + pageName).addClass("item-active")
}

const navRealmSwitch = function(realmName) {
    realm.switch(realmName)
    nav.loadNavBar()
}


window.sideNavActiveMenu = sideNavActiveMenu
window.navRealmSwitch = navRealmSwitch

export default Nav
