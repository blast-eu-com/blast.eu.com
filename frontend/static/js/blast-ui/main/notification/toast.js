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

const Toast = class {

    constructor() {
        this._id
        this._frame
        this._notifContainer
        this._msgPicture
        this._msgTitle
        this._msgText
        this._subFrame
    }

    set frame(fr) { this._frame = fr }
    set subFrame(sf) { this._subFrame = sf }
    set id(id) { this._id = id }
    set msgPicture(msgPicture) { this._msgPicture = msgPicture }
    set msgTitle(msgTitle) { this._msgTitle = msgTitle }
    set msgText(msgText) { this._msgText = msgText }
    set notifContainer(notifContainer) { this._notifContainer = notifContainer }

    get frame() { return this._frame }
    get subFrame() { return this._subFrame }
    get id() { return this._id }
    get msgPicture() { return this._msgPicture }
    get msgTitle() { return this._msgTitle }
    get msgText() { return this._msgText }
    get notifContainer() { return this._notifContainer }

    createToast = (actionRes) => {
       this.frame = document.createElement("DIV")
       this.id = "toast-" + Math.floor(Math.random() * 1000000).toString()
       this.frame.setAttribute("id", this.id)
       this.frame.setAttribute("class", "toast show")
       this.frame.setAttribute("role", "alert")
       this.frame.setAttribute("aria-live", "assertive")
       this.frame.setAttribute("aria-atomic", "true")
       if ( actionRes === "success" ) {
        this.frame.setAttribute("style", "border-top: thick solid #00BB4F")
       } else if ( actionRes === "failure" ) {
        this.frame.setAttribute("style", "border-top: thick solid red")
       }
    }

    setSubFrame = () => {
        this.subFrame = `
            <div class="toast-header">
                <img id="toast-img" src="%toast_image_path%" class="rounded me-2" alt="...">
                <strong id="toast-title" class="me-auto">%toast_title%</strong>
                <small class="text-muted">just now</small>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"
                    onclick='document.getElementById("` + this.notifContainer + `").removeChild(document.getElementById("` + this.id + `"));'></button>
            </div>
            <div id="toast-msg" class="toast-body">%toast_text%</div>
        `
    }

    updateFrameImage = () => {
        this.subFrame = this.subFrame.replace('%toast_image_path%', this.msgPicture)
    }

    updateFrameTitle = () => {
        this.subFrame = this.subFrame.replace('%toast_title%', this.msgTitle)
    }

    updateFrameText = () => {
        this.subFrame = this.subFrame.replace('%toast_text%', this.msgText)
    }

    updateFrameContent = () => {
        this.setSubFrame()
        this.updateFrameImage()
        this.updateFrameTitle()
        this.updateFrameText()
    }

    notify = (actionRes) => {
        this.notifContainer = "notification-container"
        this.createToast(actionRes)
        this.updateFrameContent()
        let container = document.getElementById(this.notifContainer)
        console.log(container, this.frame)
        container.appendChild(this.frame)
        $("#" + this.id).html(this.subFrame)
    }

}

export default Toast