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

// Utilities: Tests

'use strict';

import {jest} from '@jest/globals';
import * as fs from 'fs';
import * as util from '../../src/util.mjs';

test(`util.delay works properly`, () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');

    util.delay(1000);
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);

    jest.useRealTimers();
});

test(`util.randomIntFromInterval(17,23) is between 17 and 23 inclusive`, () => {
    for ( let ii = 0; ii < 10; ii += 1 ) {
        const v = util.randomIntFromInterval(17,23);
        expect(v).toBeGreaterThan(16);
        expect(v).toBeLessThan(24);
    }
});

test(`util.getUserIdFromReq works properly`, () => {
    const req = {
        get: function(hh) {
            if ( hh === 'x-mockfirebolt-userid' ) {
                return '987';
            }
            return '555';
        }
    };
    const v = util.getUserIdFromReq(req);
    expect(v).toBe('987');
});

test(`util.getUserIdFromReq works properly to get defaultUserId`, () => {
    const req = {
        get: function(hh) {
            if ( hh === 'x-mockfirebolt-userid' ) {
                return undefined;
            }
        }
    };
    const v = util.getUserIdFromReq(req);
    expect(v).toBe('12345');
});

test(`util.createTmpFile returns a file whose name contains the given prefix and suffix and which exists`, () => {
    const prefix = 'prefix';
    const postfix = 'postfix';

    const tmpObj = util.createTmpFile(prefix, postfix);
    const fileName = tmpObj.name;

    const idxPrefix  = fileName.indexOf(prefix);
    const idxPostfix = fileName.indexOf(postfix);

    expect(idxPrefix).toBeGreaterThan(-1);
    expect(idxPostfix).toBeGreaterThan(idxPrefix);

    expect(fs.existsSync(fileName)).toBeTruthy();

    // Cleanup after ourselves
    tmpObj.removeCallback();
});

test(`util.mergeArrayOfStrings works properly`, () => {
    const dummyOverrideFlags = ["test"];
    const dumOverrideFlags = undefined;
    const dummyDenyFlags = { test: { id: 1 } };
    const result = util.mergeArrayOfStrings(
        dummyOverrideFlags,
        dumOverrideFlags,
        dummyDenyFlags
    );
    expect(result).toEqual(["test"]);
});
