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

import TopBar from "./topBar.js"
import SideBar from "./sideBar.js"

var topBar = new TopBar()
var sideBar = new SideBar()

/* to be reviewed
pagePreload = () => {
    document.onreadystatechange = function() {
        if (document.readyState !== 'complete' ) {
            document.querySelector('body').style.visibility = 'hidden' ;
        } else if ( document.readyState === 'complete' ) {
            document.querySelector('body').style.visibility = 'visible'
        }
    }
}
*/

function mainUI(pageName) {
    topBar.render()
    sideBar.render(pageName)
}


window.mainUI = mainUI
window.activeSideBarMenu = sideBar.activeSideBarMenu
window.switchRealm = topBar.switchRealm
window.searchGlobal = topBar.searchGlobal