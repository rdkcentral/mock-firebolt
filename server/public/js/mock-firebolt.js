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

let mf = {};

mf.state = {};
mf.state.meta = null;
mf.state.search = '';
mf.state.newSearch = '';
mf.state.openedMethods = {};  // Keys are method names; values are simply 'true' (we only care about existence)

mf.baseUrl = 'http://localhost:3333';

// params:
// - url         : Mandatory
// - method      : Mandatory: One of GET, POST, ...
// - timeout     : Optional. In ms. Default is 0 -- NO TIMEOUT!
// - headers     : Optional. Default {}.
// - data        : Mandatory: String (!)
// - fSuccess    : Mandatory: Signature: f(Anything data, String textStatus, jqXHR jqXHR)
// - fError      : Mandatory: Signature: f(jqXHR jqXHR, String textStatus, String errorThrown)
// - contentType : Default: 'application/x-www-form-urlencoded; charset=UTF-8'
// - dataType    : Default: smart guess (data type of expected result); json, ...
// - processData : Optional. Default is true
mf.request = function request(params) {
  let ajaxParams = {};
  ajaxParams.url = params.url;
  ajaxParams.type = params.method;
  ajaxParams.method = params.method;
  if ( params.timeout ) { ajaxParams.timeout = params.timeout; }
  if ( params.headers ) { ajaxParams.headers = params.headers; }
  ajaxParams.data = params.data;
  ajaxParams.success = params.fSuccess;
  ajaxParams.error = params.fError;
  if ( params.contentType ) { ajaxParams.contentType = params.contentType; }
  if ( params.dataType ) { ajaxParams.dataType = params.dataType; }
  if ( params.hasOwnProperty('processData') ) { ajaxParams.processData = params.processData; }
  //console.log('=================');
  //console.log(JSON.stringify(ajaxParams, null, 4));
  //console.log('=================');
  $.ajax(ajaxParams);
};

// Log object
mf.log = function log(params) {
  console.log(params);
};
