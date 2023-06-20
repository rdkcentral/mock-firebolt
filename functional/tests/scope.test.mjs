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

"use strict";

import { expect, jest, test, afterAll, beforeAll } from "@jest/globals";
import * as utilities from "./utilities.mjs";

jest.setTimeout(20000);

beforeAll(async () => {
    const response = await utilities.mfState(
        true,
        ` -- --mock`
    );
    console.log(response)
    expect(response).toBe("MF started successfully");
});

afterAll(async () => {
    //Stop Mock Firebolt
    const response = await utilities.killPort(9998);
    console.log(response)
    expect(response).toBe("Port Killed");
});

// Updating method for a particular user
test(`Validate group scope updates`, async () => {

    const userId = "123~A"
    const group = "~A"
    const fbCommand = "accessibility.closedCaptionsSettings"

    //Validate the OpenRPC response
    let result = await utilities.fireboltCommand(
        JSON.stringify({
            method: fbCommand,
            params: {},
            id: 0,
          }), null, userId)
    console.log(JSON.stringify(result))
    expect(result.includes('\"fontFamily\":\"Monospace sans-serif\"')).toBe(true)

    //Set an override for group ~A
    await utilities.callMfCli(
        `cd ../cli/src/ && node cli.mjs --upload ../examples/accessibility-closedCaptionsSettings.json --user ${group} && cd ../../functional`,
        true
    );
    
    //Validate the override took effect
    result = await utilities.fireboltCommand(
        JSON.stringify({
            method: fbCommand,
            params: {},
            id: 0,
          }), null, userId)
    console.log(JSON.stringify(result))
    expect(result.includes('\"fontFamily\":\"testValue1\"')).toBe(true)

    //Set a second override for group ~A impacting the same API call
    await utilities.callMfCli(
        `cd ../cli/src/ && node cli.mjs --upload ../examples/accessibility-closedCaptionsSettings2.json --user ${group} && cd ../../functional`,
        true
    );

    //Validate the second override took effect
    result = await utilities.fireboltCommand(
        JSON.stringify({
            method: fbCommand,
            params: {},
            id: 0,
          }), null, userId)
    console.log(JSON.stringify(result))
    expect(result.includes('\"fontFamily\":\"testValue2\"')).toBe(true)
 });