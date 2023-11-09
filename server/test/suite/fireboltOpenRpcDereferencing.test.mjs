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

//fireboltOpenRpcDereferencing: Tests

"use strict";

import * as fireboltOpenRpcDereferencing from '../../src/fireboltOpenRpcDereferencing.mjs';
import { meta } from '../mocks/mockOpenRpcJson.mjs';

describe(`fireboltOpenRpcDereferencing`, () => {
  describe(`isObject`, () => {
    test(`should identify an object properly`, () => {
      expect(fireboltOpenRpcDereferencing.testExports.isObject({})).toBeTruthy();
      expect(fireboltOpenRpcDereferencing.testExports.isObject(null)).toBeFalsy();
      expect(fireboltOpenRpcDereferencing.testExports.isObject('string')).toBeFalsy();
    });
  })

  describe(`isArray`, () => {
    test(`should identify an array`, () => {
      expect(fireboltOpenRpcDereferencing.testExports.isArray([])).toBeTruthy();
      expect(fireboltOpenRpcDereferencing.testExports.isArray({})).toBeFalsy();
      expect(fireboltOpenRpcDereferencing.testExports.isArray('string')).toBeFalsy();
    });
  });

  describe(`ref2schemaName`, () => {
    test(`should extract schema name from ref string`, () => {
      expect(fireboltOpenRpcDereferencing.testExports.ref2schemaName('#/components/schemas/Example')).toBe('Example');
    });
  });

  describe(`lookupSchema`, () => {
    test(`should lookup schema by ref`, () => {
      const metaMock = {
        'x-schemas': {
          'Example': {
            'Example': { 'Property': 'Value' }
          }
        },
        'components': {
          'schemas': {
            'Example': {
              'Property': 'Value'
            }
          }
        }
      };
      expect(fireboltOpenRpcDereferencing.testExports.lookupSchema(metaMock, '#/components/schemas/Example')).toEqual({ 'Property': 'Value' });
      expect(fireboltOpenRpcDereferencing.testExports.lookupSchema(metaMock, '#/x-schemas/Example', 'Example')).toEqual({ 'Property': 'Value' });
    });
  });

  describe(`dereferenceMeta`, () => {
    test(`fireboltOpenRpcDereferencing works properly`, () => {
      const result = fireboltOpenRpcDereferencing.dereferenceMeta(meta);
      expect(result).toEqual(expect.not.objectContaining({ components: {} }));
    });
  });

  describe(`replaceRefArr`, () => {
    test(`replaceRefArr works properly`, () => {
      const testArrWithItemWithRef = [];
      const testPosInArrWithRef = 0;
      const testLookedUpSchema = { test: "Test" };
      const expectedResult = [{ test: "Test" }];
      fireboltOpenRpcDereferencing.testExports.replaceRefArr(
        testArrWithItemWithRef,
        testPosInArrWithRef,
        testLookedUpSchema
      );
      expect(testArrWithItemWithRef).toEqual(
        expect.arrayContaining(expectedResult)
      );
    });
  });

  describe(`replaceRefObj`, () => {
    test(`replaceRefObj works properly`, () => {
      const parentOfObjWithRef = {
        foo: { '$ref': 'xxx' }
      };
      const keyWithinObjWithRef = 'foo';
      const lookedUpSchema = { type: 'string', description: 'This is a schema' };
      const expectedResult = {
        foo: { type: 'string', description: 'This is a schema' }
      };
    
      fireboltOpenRpcDereferencing.testExports.replaceRefObj(parentOfObjWithRef, keyWithinObjWithRef, lookedUpSchema);
    
      expect(parentOfObjWithRef).toEqual(expectedResult);
      expect(parentOfObjWithRef.foo).not.toHaveProperty('$ref');
    });
  });

  describe(`selfReferenceSchemaCheck`, () => {
    test(`selfReferenceSchemaCheck returns true for self-referencing schema objects`, () => {
      const path = '#/components/schemas/SelfRef';
      const schemaObjSelfRef = {
        '$ref': path
      };
    
      expect(fireboltOpenRpcDereferencing.testExports.selfReferenceSchemaCheck(schemaObjSelfRef, path)).toBe(true);
    });
    
    test(`selfReferenceSchemaCheck returns false for non-self-referencing schema objects`, () => {
      const path = '#/components/schemas/NonSelfRef';
      const schemaObjNonSelfRef = {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      };
    
      expect(fireboltOpenRpcDereferencing.testExports.selfReferenceSchemaCheck(schemaObjNonSelfRef, path)).toBe(false);
    });
    
    test(`selfReferenceSchemaCheck returns true for nested self-referencing schema objects`, () => {
      const path = '#/components/schemas/NestedSelfRef';
      const schemaObjNestedSelfRef = {
        type: 'object',
        properties: {
          nested: { '$ref': path }
        }
      };
    
      expect(fireboltOpenRpcDereferencing.testExports.selfReferenceSchemaCheck(schemaObjNestedSelfRef, path)).toBe(true);
    });
  });

  describe(`replaceRefs`, () => {
    test(`replaceRefs works properly`, () => {
      // Usingadvertising.advertisingId example
      const method = meta.core.methods[1];
      const expectedSchema = {
        ...meta.core.components.schemas.AdvertisingIdOptions,
      };

      // Call replaceRefs on the 'params' of the method
      fireboltOpenRpcDereferencing.testExports.replaceRefs(meta.core, method, 'params');

      // 'params' should now be an array with the dereferenced schema as its first element
      expect(method.params[0].schema).toEqual(expectedSchema);
    });
  });
});
