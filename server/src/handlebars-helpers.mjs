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

// Handlebars Helpers

'use strict';

const helpers = {
  ifEq: function(a, b, options) {
    if ( a === b ) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
  moduleName: function(a, options) {
    const parts = a.split('.');
    return parts[0];
  },
  functionName: function(a, options) {
    const parts = a.split('.');
    if ( parts.length < 2 ) { return 'error'; }
    return parts[1].toLowerCase();
  },
  isDeprecated: function(a, options) {
    let isDeprecated = false;
    if ( a.tags && a.tags.length > 0 && a.tags.filter(oTag => oTag.name === 'deprecated').length > 0 ) {
      isDeprecated = true;
    }
    if ( isDeprecated ) {
      return options.fn(this);
    }
    return options.inverse(this);
  }
};

// --- Exports ---

export { helpers };
