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
const FrontendConfig = class {

    constructor() {
        /*
         * this frontend is used to pass ajax query from the frontend to the backend
         * note that the frontend is not contacting the backend in direct
         * it loops back to the nginx (frontend) and the request is proxy pass to the backend
         * this permits to avoid direct access, also it permits the backend to be listening on internal ip only
         * this way the backend is not available from outside expect passing thru the nginx (frontend)
         */
        this.frontend = {
            hostname: "192.168.168.59", // this hostname must be the frontend site url
            port: "443", // this port must be the frontend port number
            protocol: "https", // this protocol must be the site protocol
            version: "v1",
            webServerPath: "/opt/blast.eu.com/frontend/static",
            httpImgFolder: "/img"
        }
        if ($.cookie('account') && !!$.cookie('account')) {
            let accountFirstName = (Object.keys(JSON.parse($.cookie("account"))).includes("first_name")) ? JSON.parse($.cookie('account'))["first_name"] : ""
            let accountFamilyName = (Object.keys(JSON.parse($.cookie("account"))).includes("family_name")) ? JSON.parse($.cookie('account'))["family_name"] : ""
            let accountPicture = (Object.keys(JSON.parse($.cookie("account"))).includes("picture")) ? JSON.parse($.cookie('account'))["picture"] : "profile-picture.png"
            this.session = {
                accountId: JSON.parse($.cookie('account'))["id"],
                accountEmail: JSON.parse($.cookie('account'))["email"],
                accountFirstName: accountFirstName,
                accountFamilyName: accountFamilyName,
                accountPicture: accountPicture,
                realm: JSON.parse($.cookie('realm'))["name"],
                realmId: JSON.parse($.cookie('realm'))["id"],
                realms: JSON.parse($.cookie('realms')),
                setting: JSON.parse($.cookie('setting')),
                settingId: JSON.parse($.cookie('setting'))["id"],
                httpToken: 'Bearer ' + $.cookie('jwt')
            }
        }
    }

    get proxyURL() { return this.frontend.protocol + "://" + this.frontend.hostname + ":" + this.frontend.port }
    get proxyAPI() { return this.proxyURL + '/api/' + this.frontend.version }

}


export default FrontendConfig
