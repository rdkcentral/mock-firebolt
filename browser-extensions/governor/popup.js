/*
* Copyright 2021 Comcast Cable Communications Management, LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* SPDX-License-Identifier: Apache-2.0
*/

'use strict';


let BGPage = chrome.extension.getBackgroundPage();


const Modes = {
  Main            : 'Main',
  EnterPortNumber : 'EnterPortNumber'
};
let mode = Modes.EnterPortNumber;


function get(id) { return document.getElementById(id); }
const $enterMockFireboltPort         = get('enterMockFireboltPort');
const $mockFireboltPort              = get('mockFireboltPort');
const $btnSaveMockFireboltPort       = get('btnSaveMockFireboltPort');
const $msgMockFireboltPort           = get('msgMockFireboltPort');
const $sendFireboltLifecycleEvent    = get('sendFireboltLifecycleEvent');
const $btnGear                       = get('btnGear');
const $btnSendInactive               = get('btnSendInactive');
const $btnSendBackground             = get('btnSendBackground');
const $btnSendForeground             = get('btnSendForeground');
const $msgSendFireboltLifecycleEvent = get('msgSendFireboltLifecycleEvent');
const $errorMessage                  = get('errorMessage ');


function gotoMode(mode) {
  if ( Modes.hasOwnProperty(mode) ) {
    if ( mode === Modes.Main ) {
      $enterMockFireboltPort.style.display = 'none';
      $sendFireboltLifecycleEvent.style.display = 'block';
    } else {
      $enterMockFireboltPort.style.display = 'block';
      $sendFireboltLifecycleEvent.style.display = 'none';
    }
  } else {
    $errorMessage.innerHTML = `Internal Error: gotoMode: ${mode} is not a valid mode.`;
  }
}


function checkIfValidPortNumber(portNumber) {
  // Regular expression to check if number is a valid port number
  const regexExp = /^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/gi;
  return regexExp.test(portNumber);
}


function savePortNumberIfValid(portNumber) {
  if ( checkIfValidPortNumber(portNumber) ) {
    BGPage.setPortNumber(portNumber);
    $msgMockFireboltPort.innerHTML = '';
    gotoMode(Modes.Main);
  } else {
    $msgMockFireboltPort.innerHTML = '<span style="color:red;">Port number is not valid. Please try again.</span>';
  }
}


// Add event handlers

function showSendResult(err, result) {
  if ( err ) {
    $msgSendFireboltLifecycleEvent.innerHTML = `<span style="color:red;">Could not send lifecycle event<br />(${JSON.stringify(err, Object.getOwnPropertyNames(err))})</span>`;
  } else {
    $msgSendFireboltLifecycleEvent.innerHTML = `Lifecycle event sent successfully.`;
  }
}

$btnGear.addEventListener('click', function() {
  gotoMode(Modes.EnterPortNumber);
});

$btnSaveMockFireboltPort.addEventListener('click', function() {
  let portNumber = $mockFireboltPort.value;
  if ( portNumber ) { portNumber = parseInt(portNumber, 10); }
  savePortNumberIfValid(portNumber);
});

$btnSendInactive.addEventListener('click', async function() {
  const result = await BGPage.sendFireboltLifecycleEvent_Inactive(showSendResult);

});

$btnSendBackground.addEventListener('click', async function() {
  const result = await BGPage.sendFireboltLifecycleEvent_Background(showSendResult);
});

$btnSendForeground.addEventListener('click', async function() {
  const result = await BGPage.sendFireboltLifecycleEvent_Foreground(showSendResult);
});


// "Main"/initial processing starts here

let portNumber = BGPage.getPortNumber();

if ( ! portNumber ) {
  // User has not yet set her port number
  gotoMode(Modes.EnterPortNumber);
} else {
  // User has already set her port number
  gotoMode(Modes.Main);
}
