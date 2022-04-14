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

import InfrastructureForm from './form.js'
import InfrastructureList from './list.js'
var infrastructureForm = new InfrastructureForm('infrastructureForm')
var infrastructureList = new InfrastructureList()

function main() {
    infrastructureForm.render()
    infrastructureList.render()
}

window.main = main
window.addInfrastructure = infrastructureForm.addInfrastructure
window.simpleListGoToPrevPage = infrastructureList.simpleListGoToPrevPage
window.simpleListGoToNextPage = infrastructureList.simpleListGoToNextPage
window.simpleListGoToThisPage = infrastructureList.simpleListGoToThisPage