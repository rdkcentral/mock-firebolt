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

import * as dom from './dom.js';
import * as stateManagement from './stateManagement.js';

function handleKeyEvent(keyName, fHandleKeyEvent) {
  fHandleKeyEvent.call(null, keyName);
  if ( stateManagement.getIsKeyForwarding() ) {
    dom.$mostRecentKeyEvent.innerHTML = keyName;
  }
}

function setupKeyListener(fHandleKeyEvent) {
  document.addEventListener('keydown', function(event) {
    if ( event.which === 8 ) {
      handleKeyEvent('BACK', fHandleKeyEvent);
      event.preventDefault();
    } else if ( event.which === 13 ) {
      handleKeyEvent('OK', fHandleKeyEvent);
      event.preventDefault();
    } else if ( event.which === 39 ) {
      handleKeyEvent('RIGHT', fHandleKeyEvent);
    } else if ( event.which === 37 ) {
      handleKeyEvent('LEFT', fHandleKeyEvent);
    } else if ( event.which === 40 ) {
      handleKeyEvent('DOWN', fHandleKeyEvent);
    } else if ( event.which === 38 ) {
      handleKeyEvent('UP', fHandleKeyEvent);
    } else if ( event.which >= 48 && event.which <= 57 ) {
      handleKeyEvent(`${event.which - 48}`, fHandleKeyEvent);
    //} else {
      // Ignore all other keys
    }
  });
}

export {
  setupKeyListener
}
