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

// InteractionLogs: Tests

import {jest} from '@jest/globals';
import { createAndSendInteractionLog } from "../../src/interactionLog.mjs";
import { logger } from "../../src/logger.mjs";

test(`interactionLogs.createAndSendInteractionLog works properly`, () => {
    const debugSpy = jest.spyOn(logger, "debug");
    createAndSendInteractionLog('{name: "id"}', "account.id", {}, {send: () => {}}, '12345' );
    expect(debugSpy).toHaveBeenCalled();
});

test(`interactionLogs.createAndSendInteractionLog works properly without ws object`, () => {
    const errorSpy = jest.spyOn(logger, "error");
    createAndSendInteractionLog('{name: "id"}', "account.id", {}, undefined );
    expect(errorSpy).toHaveBeenCalled();
});