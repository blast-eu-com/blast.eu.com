/*
   Copyright 2021 Jerome DE LUCCHI

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
import Realm from "../../../realm.js";
import Account from "../../../aaa.js"
import FrontendConfig from "../../../frontend.js"

var realm = new Realm()
var account = new Account()
var config = new FrontendConfig()

let TopBar = class {

    constructor() {

        this.frame = `
            <style>
                li#navDropDown:hover { background-color: rgba(0,0,0,0) ; }
            </style>

            <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <!-- <nav class="navbar navbar-expand-lg navbar-dark" style="background-color: #306998"> -->
                <a class="navbar-brand" style="width: 201px; text-align: center;">
                    <img src="/img/blast_header_yellow.ico" width="120" height="40" class="d-inline-block align-bottom"/>
                </a>
                <div class="dropdown p-1 mx-3" style="border-left: thin solid gray; border-right: thin solid gray;">
                    <img id="dropDownProfileMenuLink" data-toggle="dropdown-toggle" type="button"
                         style="margin-left: 10px; margin-right: 10px;" data-bs-toggle="dropdown"
                         src="" width="36" height="36" />
                    <div class="dropdown-menu mr-3 mt-2 bg-dark" style="z-index: 1001" aria-labelledby="dropDownProfileMenuLink">
                        <a class="dropdown-item bg-dark text-light" href="/html/profile.html">
                            <img src="/img/object/profile.svg" width="24" height="24" /><span style="margin-left: 24px">Profile</span></a>
                        <a class="dropdown-item bg-dark text-light" href="/html/request.html">
                            <img src="/img/object/email.svg" width="24" height="24" /><span style="margin-left: 24px">Request</span></a>
                        <div class="dropdown-divider seconday"></div>
                        <a id="userAccountLogout" class="dropdown-item bg-dark text-light" href="/html/logout.html">
                            <img src="/img/object/logout.svg" width="24" height="24" /><span style="margin-left: 24px">Logout</span></a>
                    </div>
                </div>
                <div class="collapse navbar-collapse" id="navbarSupportedContent" style="max-width: 500px;">
                    <ul class="navbar-nav">
                        <li id="navDropDown" class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle blast-nav-realm" id="realmDropDownMenu" role="button"
                            data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></a>
                            <div class="dropdown-menu mt-2 bg-dark text-light" id="navRealmDropDownMenu" aria-labelledby="navbarDropdown"
                                 style="height: 150px; overflow-y: scroll"></div>
                        </li>
                    </ul>     
                </div>
                <div>
                    <div class="input-group">
                        <input id="globalSearch" class="form-control" size="64" type="search" style="background-color: #373A3E; color: #EEE; border: thin solid #373A3E" />
                        <a class="btn blast-btn" type="button" href="#global_search_result" rel="modal:open" onclick="searchGlobal() ;" style="color: #EEE;">Search</a>
                    </div>
                </div>
            `
    }

    loadRealm = () => {
        let html = ''
        let realmName = JSON.parse($.cookie("realm"))["name"]
        $("#realmDropDownMenu").html(realmName)
        JSON.parse($.cookie("account"))["realm"].forEach((realm) => {
            if ( realmName !== realm["name"]) {
                html = html + `<a class="dropdown-item blast-nav-dropdown-realm" onclick="switchRealm('` + realm["name"] + `')">` + realm["name"] + `</a>`
                $("#navRealmDropDownMenu").html(html)
            }
        })
    }

    loadProfilePicture = () => {
        let accountPicture = (Object.keys(JSON.parse($.cookie("account"))).includes("picture")) ? JSON.parse($.cookie("account"))["picture"] : ""
        window.parent.$("img#dropDownProfileMenuLink").prop("src", config.frontend.httpImgFolder + '/profile/' + accountPicture)
    }

    loadTopBarGSearch = () => {
        let gSearchString = JSON.parse($.cookie("gSearch"))["string"]
        console.log(gSearchString)
        if ( gSearchString !== undefined ) {
            $("input#globalSearch").val(gSearchString)
        }
    }

    load = () => {
        $("#nav_container").html(this.frame)
        this.loadRealm()
        this.loadProfilePicture()
    }

    render = () => {
        this.load()
    }

    switchRealm = (realmName) => {
        realm.switch(realmName)
        this.loadRealm()
    }

    searchGlobal = () => {
        let searchString = $("input#globalSearch").val()
        $.cookie.json = true
        $.cookie.raw = true
        $.cookie('gSearch', {"string": searchString}, {path: "/"})
        location.href = "/html/gsearch.html"
    }

}

export default TopBar
