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

// Magic Date/Time Strings: Tests

'use strict';

import {jest} from '@jest/globals';
import * as fs from 'fs';
import Setup from '../Setup';
import * as magicDateTime from '../../src/magicDateTime.mjs';
import { logger } from "../../src/logger.mjs";

test(`magicDateTime.replaceDynamicDateTimeVariablesStr works properly`, () => {
    let sIn, sOut, sExpectedOut;
    const tests = [
        {
            in:  '{ "foo": "bar" }',
            expectedOut: function() {
                return '{ "foo": "bar" }';
            }
        },
        {
            in:  '{ "foo": "\"{{+0s|YYYY-MM-DD}}\"" }',
            expectedOut: function() {
                const today = new Date();
                const dd = String(today.getDate()).padStart(2, '0');
                const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                const yyyy = today.getFullYear();
                const out = yyyy + '-' + mm + '-' + dd;
                return `{ "foo": "${out}" }`;
            }
        },
        {
            in:  '{ "foo": "{{+0s|x}}" }',
            expectedOut: function() {
                const today = new Date();
                const epoch = today.getTime();
                return `{ "foo": ${epoch} }`;
            }
        }
    ];

    jest.useFakeTimers()
    jest.setSystemTime(new Date('2020-01-01'));

    //console.log('Testing magicDateTime.replaceDynamicDateTimeVariablesStr');
    for ( let ii = 0; ii < tests.length; ii += 1 ) {
        sIn = tests[ii].in;
        sOut = magicDateTime.replaceDynamicDateTimeVariablesStr(sIn, '{{', '}}');
        sExpectedOut = tests[ii].expectedOut.call(null);
        //console.log(`Test case: in: ${sIn}, expectedOut: ${sExpectedOut}`);
        expect(sOut).toBe(sExpectedOut);
    }

    jest.useRealTimers();
});

/*
// Given a JS object, replace any/all {{+2h|x}}, etc. values with appropriately
// translated date/time strings/epochs/etc and then return the traslated JSON object.
var replaceDynamicDateTimeVariablesObj = function(oJson, prefix, suffix) {
  var ss;
  try {
    ss = JSON.stringify(oJson);
    // If the object contains "foo": "\"{{+1h|x}}\"", then this will translate into "foo": "123456789000"
    ss = replaceDynamicDateTimeVariables(ss, '\\"' + prefix, suffix + '\\"');
    // If the object contains "foo": "{{+1h|x}}", then this will translate into "foo": 123456789000
    ss = replaceDynamicDateTimeVariables(ss, '"' + prefix, suffix + '"');
    // If the object contains {{+1h|x}} anywhere, then this will translate in place into 123456789000
    ss = replaceDynamicDateTimeVariables(ss, prefix, suffix);
*/

test(`magicDateTime.replaceDynamicDateTimeVariablesObj works properly`, () => {
    let objIn, objOut, objExpectedOut;
    const tests = [
        {
            in:  { "foo": "bar" },
            expectedOut: function() {
                return { "foo": "bar" };
            }
        },
    
        {
            in:  { "foo": "\"{{+0s|YYYY-MM-DD}}\"" },
            expectedOut: function() {
                const today = new Date();
                const dd = String(today.getDate()).padStart(2, '0');
                const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                const yyyy = today.getFullYear();
                const out = yyyy + '-' + mm + '-' + dd;
                const final = {};
                final['foo'] = out;
                return final;
            }
        },

        {
            in:  { "foo": "{{+0s|x}}" },
            isNumber: true,
            expectedOut: function() {
                const today = new Date();
                const epoch = today.getTime();
                const final = {};
                final['foo'] = epoch;
                return final;
            }
        },
        {
            in:  { "foo": "{{-0s|x}}" },
            isNumber: true,
            expectedOut: function() {
                const today = new Date();
                const epoch = today.getTime();
                const final = {};
                final['foo'] = epoch;
                return final;
            }
        },
        {
            in:  { "foo": "{{19:00+1d|x}}" },
            isNumber: true,
            expectedOut: function() {
                const today = new Date();
                const epoch = today.getTime()+135000000;
                const final = {};
                final['foo'] = epoch;
                return final;
            }
        },
        {
            in:  { "foo": "{{19:00:00+1d|x}}" },
            isNumber: true,
            expectedOut: function() {
                const today = new Date();
                const epoch = today.getTime()+135000000;
                const final = {};
                final['foo'] = epoch;
                return final;
            }
        },
    ];

    jest.useFakeTimers()
    jest.setSystemTime(new Date('2020-01-01'));

    //console.log('Testing magicDateTime.replaceDynamicDateTimeVariablesObj');
    for ( let ii = 0; ii < tests.length; ii += 1 ) {
        objIn = tests[ii].in;
        objOut = magicDateTime.replaceDynamicDateTimeVariablesObj(objIn, '{{', '}}');
        objExpectedOut = tests[ii].expectedOut.call(null);
        if (tests[ii] && tests[ii].isNumber) {
            expect(typeof objOut.foo).toBe('number');
        } else {
            expect(objOut).toMatchObject(objExpectedOut);
        }
    }

    jest.useRealTimers();
});

test(`magicDateTime.replaceDynamicDateTimeVariablesObj error scenario`, () => {
    const spy = jest.spyOn(logger, 'error');
    magicDateTime.replaceDynamicDateTimeVariablesObj({ "foo": "{{23*19:00:00+1d|x}}" }, '{{', '}}');
    expect(spy).toHaveBeenCalled();
});
