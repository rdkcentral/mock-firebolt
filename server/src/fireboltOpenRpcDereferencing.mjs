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

// Dereferencing Logic

'use strict';

import { config } from './config.mjs';

function isObject(thing) { return ( thing === Object(thing) ); }
function isArray(thing)  { return ( Array.isArray(thing) );    }

function ref2schemaName(ref) {
  return ref.substring(ref.lastIndexOf('/') + 1);
}
function lookupSchema(metaForSdk, ref) {
  const schemaName = ref2schemaName(ref);
  return metaForSdk.components.schemas[schemaName];
}

// For { foo: { '$ref': 'xxx' } }, change to { foo: <lookedUpSchema> }
function replaceRefObj(parentOfObjWithRef, keyWithinObjWithRef, lookedUpSchema) {
  parentOfObjWithRef[keyWithinObjWithRef] = Object.assign({}, lookedUpSchema, parentOfObjWithRef[keyWithinObjWithRef]);
  delete parentOfObjWithRef[keyWithinObjWithRef]['$ref'];
}

// For [ { '$ref': 'xxx' }, ... ], change to [ <lookedUpSchema>, ... ]
function replaceRefArr(arrWithItemWithRef, posInArrWithRef, lookedUpSchema) {
  arrWithItemWithRef[posInArrWithRef] = lookedUpSchema;
}

// NOTE: Doesn't handle arrays of arrays
function replaceRefs(metaForSdk, thing, key) {
  let lookedUpSchema;
  if ( isObject(thing[key]) ) {
    if ( '$ref' in thing[key] ) {
      lookedUpSchema = lookupSchema(metaForSdk, ref2schemaName(thing[key]['$ref']));
      replaceRefObj(thing, key, lookedUpSchema);
    }

    for ( const key2 in thing[key] ) {
      replaceRefs(metaForSdk, thing[key], key2);
    }
  } else if ( isArray(thing[key]) ) {
    for ( let idx = 0; ii < thing[key].length; idx += 1 ) {
      if ( isObject(thing[key][idx]) ) {
        if ( '$ref' in thing[idx] ) {
          lookedUpSchema = lookupSchema(metaForSdk, ref2schemaName(thing[key][idx]['$ref']));
          replaceRefArr(thing[key], idx, lookedUpSchema);
        }
      }
    }
  }
}

function dereferenceSchemas(metaForSdk, methodName) {
  let newSchema;
  const methods = metaForSdk.methods;
  const matchMethods = methods.filter(function(method) { return method.name === methodName; });
  const matchMethod = matchMethods[0];
  const result = matchMethod.result;
  //replaceRefs(metaForSdk, result, 'schema');
  replaceRefs(metaForSdk, matchMethod, 'result');
  replaceRefs(metaForSdk, matchMethod, 'params');
}

function dereferenceMeta(_meta) {
  const meta = JSON.parse(JSON.stringify(_meta)); // Deep copy
  config.dotConfig.supportedSdks.forEach(function(oSdk) {
    const sdkName = oSdk.name;
    if ( sdkName in meta ) {
      const metaForSdk = meta[sdkName];
      const methods = metaForSdk.methods;
      for ( let mm = 0; mm < methods.length; mm += 1 ) {
        dereferenceSchemas(metaForSdk, methods[mm].name);
      }
      delete metaForSdk.components; // No longer needed
    }
  });

  return meta;
}


// --- Exports ---

export const testExports = {
  replaceRefArr
};

export {
  dereferenceMeta
};
