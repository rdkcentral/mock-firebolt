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

// sequence management

'use strict';
import {sendEvent} from './events.mjs';

function executeSequence(ws,userId,seqevent) {
  //iterating through sequence of events
  for(let i = 0; i < seqevent.length; i++) {
    let method_name = seqevent[i].event.method;
    let result_val = seqevent[i].event.result;
    let atTime_val;
    //adding delay to the previous execution time
    if (seqevent[i].delay){
      atTime_val = seqevent[i-1].at + seqevent[i].delay
    }
    else{
      atTime_val = seqevent[i].at;
    }
    setTimeout(function() {
      sendEvent(ws, userId, method_name, result_val, `${method_name}`, function(){}, function(){}, function(){});
    }, atTime_val);
  }
}

// --- Exports ---
export { executeSequence };
