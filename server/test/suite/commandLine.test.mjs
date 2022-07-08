'use strict';
import {jest} from '@jest/globals';
import {httpPort, socketPort, enabledSdkNames, enabledTriggerPaths} from '../../src/commandLine.mjs';

test('should first', () => { 
    expect(httpPort).toBe(3333);
    expect(socketPort).toBe(9998);
    expect(enabledSdkNames).toEqual(expect.arrayContaining(['core']));
    expect(enabledTriggerPaths).toEqual(expect.arrayContaining([]));
 })

