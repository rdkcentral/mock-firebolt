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

// sessionManagement: Tests

"use strict";

import fs from "fs";
import { jest } from "@jest/globals";
import { logger } from "../../src/logger.mjs";
import * as sessionManagement from "../../src/sessionManagement.mjs";

const singleExampleArray =  [
  {
    methodCall: 'accessibility.closedCaptionsSettings',
    timestamp: 1663091848444,
    sequenceId: 1,
    response: { 
      result: {
        enabled: true,
        styles: {
          fontFamily: 'Monospace sans-serif',
          fontSize: 1,
          fontColor: '#ffffff',
          fontEdge: 'none',
          fontEdgeColor: '#7F7F7F',
          fontOpacity: 100,
          backgroundColor: '#000000',
          backgroundOpacity: 100,
          textAlign: 'center',
          textAlignVertical: 'middle'
        }
      },
      timestamp: 1663091848455
    }
  },
  {
    methodCall: 'appcatalog.apps',
    params: {
      request: {}
    },
    timestamp: 1662743885216,
    sequenceId: 2,
    response: {
      error: {
          code: -32601,
          message: 'Method not found'
      }, 
      timestamp: 1663091851797
    }
  },
  {
    methodCall: 'missing.response',
    params: { type: 'platform' },
    timestamp: 1663091857761,
    sequenceId: 3,
    error: {
        code: 'Missing',
        message: 'Response'
    }
  },
  {
    methodCall: 'discovery.policy',
    timestamp: 1663091862727,
    sequenceId: 4,
    response: {
      result: false,
      timestamp: 1663091866532
    }
  },
  {
    methodCall: 'authentication.token',
    params: { type: 'platform' },
    timestamp: 1663091857761,
    sequenceId: 3,
    error: {
        code: 'CertError',
        message: 'Received response as undefined'
    },
    response: {
      result: false,
      timestamp: 1663091866532
    }
  },
];

test(`sessionManagement.stopRecording works properly in case of throwing error`, () => {
  const spy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => { return error});
  sessionManagement.startRecording();
  const result = sessionManagement.stopRecording();
  expect(spy).toHaveBeenCalled();
  expect(result).toBe(null);
});

describe(`Session`, () => {
  const session = new sessionManagement.Session();

  test(`should return null`, () => {
    const result = session.exportSession();
    expect(result).toBe(null);
  });
  test(`should return filepath`, () => {
    const spy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
    const result = session.exportSession();
    expect(spy).toHaveBeenCalled();
    expect(result).toMatch(/(sessions)/);
    spy.mockClear();
  });
});

describe(`FireboltCall`, () => {
  const fireboltCall = new sessionManagement.FireboltCall(
    "Test Method",
    "Test Parameters"
  );
  test(`should instantiate`, () => {
    expect(fireboltCall.methodCall).toEqual("Test Method");
  });
});

test(`sessionManagement.startRecording works properly`, () => {
  const spy = jest.spyOn(logger, "info");
  sessionManagement.startRecording();
  expect(spy).toHaveBeenCalled();
});

test(`sessionManagement.stopRecording works properly for file condition`, () => {
  const spy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
  sessionManagement.startRecording();
  const result = sessionManagement.stopRecording();
  expect(result).toMatch(/(sessions)/);
});

test(`sessionManagement.stopRecording works properly for else path`, () => {
  const result = sessionManagement.stopRecording();
  expect(result).toBe(null);
});

test(`sessionManagement.isRecording works properly`, () => {
  if (true) {
    sessionManagement.startRecording();
    const result = sessionManagement.isRecording();
    expect(result).toBeTruthy();
    sessionManagement.stopRecording();
  }
  const result = sessionManagement.isRecording();
  expect(result).toBeFalsy();
});

test(`sessionManagement.addCall works properly`, () => {
  sessionManagement.startRecording();
  const result = sessionManagement.addCall("methodName", "Parameters");
  expect(result).toBeUndefined();
});

test(`verify sortJsonByTime method is working`, () => {
  const session = new sessionManagement.Session();
  const spy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
  session.sortJsonByTime({ "sessionStart": 1660644687500, "sessionEnd": 1660644699862, "calls": [ { "methodCall": "moneybadger.logMoneyBadgerLoaded", "params": { "startTime": 1660644697447, "version": "4.10.0-7e1cc95" }, "timestamp": 1660644697456, "sequenceId": 1 }, { "methodCall": "lifecycle.onInactive", "params": { "listen": true }, "timestamp": 1660644697795, "sequenceId": 2, "response": { "result": { "listening": true, "event": "lifecycle.onInactive" }, "timestamp": 1660644697796 } }]});
  expect(spy).toHaveBeenCalled();
  spy.mockClear();
});

test('verify updateCallWithResponse is working', () => {
  sessionManagement.addCall("testing", {});
  const result = sessionManagement.updateCallWithResponse("testing", "testing_session", "result")
  expect(result).toBeUndefined();
})

test('verify a session output directory is created when it does not exist', () => {
  const session = new sessionManagement.Session();
  const spy = jest.spyOn(fs, "existsSync").mockImplementation(() => false);
  const spy2 = jest.spyOn(fs, "mkdirSync").mockImplementation(() => {});
  const result = session.exportSession();
  expect(spy).toHaveBeenCalled();
  expect(spy2).toHaveBeenCalled();
  expect(result).toMatch(/(sessions)/);
  spy.mockClear();
  spy2.mockClear();
})

test('verify a session output raw wrties raw output', () => {
  const session = new sessionManagement.Session();
  session.sessionOutput = 'raw';
  const spy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
  const result = session.exportSession();
  expect(spy).toHaveBeenCalled();
  expect(result).toMatch(/(raw)/);
  expect(result).toMatch(/(Succesfully wrote output in raw format to)/);
  spy.mockClear();
})

test('verify a session output mock-overrides calls conversion method', () => {
  const session = new sessionManagement.Session();
  session.sessionOutput = 'mock-overrides';
  const spy = jest.spyOn(session, "convertJsonToYml").mockImplementation(() => {});
  const result = session.exportSession();
  expect(spy).toHaveBeenCalled();
  expect(result).toMatch(/(mocks)/);
  expect(result).toMatch(/(Succesfully wrote output in mock-overrides format to)/);
  spy.mockClear();
})


test('sessionManagement.setOutputDir works properly', () => {
  sessionManagement.setOutputDir('./test');
  const sessionOutputPath = sessionManagement.getSessionOutputDir()
  const mockOutputPath = sessionManagement.getMockOutputDir()
  expect(sessionOutputPath).toBe('./test');
  expect(mockOutputPath).toBe('./test');
})

test('sessionManagement.setOutputFormat works properly', () => {
  sessionManagement.setOutputFormat('test');
  const format = sessionManagement.getOutputFormat();
  expect(format).toBe('test');
})

test('verify check params finds repetition', () => {
  const session = new sessionManagement.Session();
  const array = [
    {
      paramDetails: {
        param: {
          options: {
            environment:"prod",
            authenticationEntity:"MVPD"
          }
        },
        result: {
          adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
          adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
          adNetworkId: '519178',
          adProfileId: '12345:caf_allinone_profile',
          adSiteSectionId: 'caf_allinone_profile_section',
          adOptOut: true,
          privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
          ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
          ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
          appName: 'FutureToday',
          appBundleId: 'FutureToday.comcast',
          distributorAppId: '1001',
          deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
          coppa: 0,
          authenticationEntity: '60f72475281cfba3852413bd53e957f6'
        }
      }
    },{
      paramDetails: {
        param: {
          options: {
            environment:"prod",
            authenticationEntity:"MVPD"
          }
        },
        result: {
          adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
          adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
          adNetworkId: '519178',
          adProfileId: '12345:caf_allinone_profile',
          adSiteSectionId: 'caf_allinone_profile_section',
          adOptOut: true,
          privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
          ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
          ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
          appName: 'FutureToday',
          appBundleId: 'FutureToday.comcast',
          distributorAppId: '1001',
          deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
          coppa: 0,
          authenticationEntity: '60f72475281cfba3852413bd53e957f6'
        }
      }
    }
  ]
  const object = {
    paramDetails: {
      param: {
        options: {
          environment:"prod",
          authenticationEntity:"MVPD"
        }
      },
      result: {
        adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
        adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
        adNetworkId: '519178',
        adProfileId: '12345:caf_allinone_profile',
        adSiteSectionId: 'caf_allinone_profile_section',
        adOptOut: true,
        privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
        ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
        ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
        appName: 'FutureToday',
        appBundleId: 'FutureToday.comcast',
        distributorAppId: '1001',
        deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
        coppa: 0,
        authenticationEntity: '60f72475281cfba3852413bd53e957f6'
      }
    }
  }
  const result = session.checkParams(array, object);
  expect(result).toBeTruthy;
})

test('verify check params does not find repetition', () => {
  const array = [
    {
      paramDetails: {
        param: {
          options: {
            environment:"prod",
            authenticationEntity:"MVPD"
          }
        },
        result: {
          adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
          adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
          adNetworkId: '519178',
          adProfileId: '12345:caf_allinone_profile',
          adSiteSectionId: 'caf_allinone_profile_section',
          adOptOut: true,
          privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
          ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
          ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
          appName: 'FutureToday',
          appBundleId: 'FutureToday.comcast',
          distributorAppId: '1001',
          deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
          coppa: 0,
          authenticationEntity: '60f72475281cfba3852413bd53e957f6'
        }
      }
    },{
      paramDetails: {
        param: {
          options: {
            coppa : "false",
            environment:"prod",
            authenticationEntity:"MVPD"
          }
        },
        result: {
          adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
          adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
          adNetworkId: '519178',
          adProfileId: '12345:caf_allinone_profile',
          adSiteSectionId: 'caf_allinone_profile_section',
          adOptOut: true,
          privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
          ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
          ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
          appName: 'FutureToday',
          appBundleId: 'FutureToday.comcast',
          distributorAppId: '1001',
          deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
          coppa: 0,
          authenticationEntity: '60f72475281cfba3852413bd53e957f6'
        }
      }
    }
  ]
  const object = {
    paramDetails: {
      param: {
        options: {
          coppa : "true",
          environment:"prod",
          authenticationEntity:"MVPD"
        }
      },
      result: {
        adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
        adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
        adNetworkId: '519178',
        adProfileId: '12345:caf_allinone_profile',
        adSiteSectionId: 'caf_allinone_profile_section',
        adOptOut: true,
        privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
        ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
        ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
        appName: 'FutureToday',
        appBundleId: 'FutureToday.comcast',
        distributorAppId: '1001',
        deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
        coppa: 0,
        authenticationEntity: '60f72475281cfba3852413bd53e957f6'
      }
    }
  }
  const session = new sessionManagement.Session();
  const result = session.checkParams(array, object);
  expect(result).toBeFalsy;
})

test('verify handleMultipleExampleMethod with multiple types of params', () => {
  const method = 'advertising.config';
  const array = [
    {
      paramDetails: {
        param: {
          anotherParam : "true",
          options: {
            environment:"prod",
            authenticationEntity:"MVPD"
          }
        },
        result: {
          adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
          adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
          adNetworkId: '519178',
          adProfileId: '12345:caf_allinone_profile',
          adSiteSectionId: 'caf_allinone_profile_section',
          adOptOut: true,
          privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
          ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
          ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
          appName: 'FutureToday',
          appBundleId: 'FutureToday.comcast',
          distributorAppId: '1001',
          deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
          coppa: 0,
          authenticationEntity: '60f72475281cfba3852413bd53e957f6'
        }
      }
    }, {
      paramDetails: {
        param: {
          options: {
            coppa : "false",
            environment:"prod",
            authenticationEntity:"MVPD"
          }
        },
        result: {
          adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
          adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
          adNetworkId: '519178',
          adProfileId: '12345:caf_allinone_profile',
          adSiteSectionId: 'caf_allinone_profile_section',
          adOptOut: true,
          privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
          ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
          ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
          appName: 'FutureToday',
          appBundleId: 'FutureToday.comcast',
          distributorAppId: '1001',
          deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
          coppa: 0,
          authenticationEntity: '60f72475281cfba3852413bd53e957f6'
        }
      }
    }, {
      paramDetails: {
        param: {
          options: {
            coppa : "true",
            environment:"prod",
            authenticationEntity:"MVPD"
          },
          anotherParam : true
        },
        result: {
          adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
          adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
          adNetworkId: '519178',
          adProfileId: '12345:caf_allinone_profile',
          adSiteSectionId: 'caf_allinone_profile_section',
          adOptOut: true,
          privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
          ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
          ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
          appName: 'FutureToday',
          appBundleId: 'FutureToday.comcast',
          distributorAppId: '1001',
          deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
          coppa: 0,
          authenticationEntity: '60f72475281cfba3852413bd53e957f6'
        }
      }
    }, 
  ]
  const session = new sessionManagement.Session();
  const result = session.handleMultipleExampleMethod(method, array);
  expect(result).toMatch('function (ctx,params){');
  expect(result).toMatch('if(JSON.stringify(params.anotherParam)  ===  \"true\" && JSON.stringify(params.options)  ===  \'{\"environment\":\"prod\",\"authenticationEntity\":\"MVPD\"}\'){');
  expect(result).toMatch('else if(JSON.stringify(params.options)  ===  \'{\"coppa\":\"false\",\"environment\":\"prod\",\"authenticationEntity\":\"MVPD\"}\'){');
  expect(result).toMatch('else if(JSON.stringify(params.options)  ===  \'{\"coppa\":\"true\",\"environment\":\"prod\",\"authenticationEntity\":\"MVPD\"}\' && JSON.stringify(params.anotherParam)  ===  true){');
  expect(result).toMatch("throw new ctx.FireboltError(-32888,'advertising.config is not working')");  
})

test('verify handleMultipleExampleMethod using a default param', () => {
  const method = 'advertising.config';
  const array = [
    {
      paramDetails: {
        param: {
          options: {
            environment:"prod",
            authenticationEntity:"MVPD"
          }
        },
        result: {
          adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
          adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
          adNetworkId: '519178',
          adProfileId: '12345:caf_allinone_profile',
          adSiteSectionId: 'caf_allinone_profile_section',
          adOptOut: true,
          privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
          ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
          ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
          appName: 'FutureToday',
          appBundleId: 'FutureToday.comcast',
          distributorAppId: '1001',
          deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
          coppa: 0,
          authenticationEntity: '60f72475281cfba3852413bd53e957f6'
        }
      }
    }, {
      paramDetails: {
        param: {},
        result: {
          adServerUrl: 'http://demo.v.fwmrm.net/ad/p/1',
          adServerUrlTemplate: 'http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D',
          adNetworkId: '519178',
          adProfileId: '12345:caf_allinone_profile',
          adSiteSectionId: 'caf_allinone_profile_section',
          adOptOut: true,
          privacyData: 'ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K',
          ifaValue: '01234567-89AB-CDEF-GH01-23456789ABCD',
          ifa: 'ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==',
          appName: 'FutureToday',
          appBundleId: 'FutureToday.comcast',
          distributorAppId: '1001',
          deviceAdAttributes: 'ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=',
          coppa: 0,
          authenticationEntity: '60f72475281cfba3852413bd53e957f6'
        }
      }
    }
  ]
  const session = new sessionManagement.Session();
  const result = session.handleMultipleExampleMethod(method, array);
  expect(result).toMatch('function (ctx,params){');
  expect(result).toMatch('if(JSON.stringify(params.options)  ===  \'{\"environment\":\"prod\",\"authenticationEntity\":\"MVPD\"}\'){');
  expect(result).toMatch('else{');
})

test('verify handleSingleExampleMethod works for call with result object', () => {
  let staticObject = {};
  staticObject["methods"] = 'accessibility.closedCaptionsSettings';
  let obj;
  const session = new sessionManagement.Session();
  const result = session.handleSingleExampleMethod(singleExampleArray, staticObject, 'accessibility.closedCaptionsSettings', obj, 0);
  expect(JSON.stringify(result)).toMatch('{\"methods\":{\"accessibility.closedCaptionsSettings\":{\"result\":{\"enabled\":true,\"styles\":{\"fontFamily\":\"Monospace sans-serif\",\"fontSize\":1,\"fontColor\":\"#ffffff\",\"fontEdge\":\"none\",\"fontEdgeColor\":\"#7F7F7F\",\"fontOpacity\":100,\"backgroundColor\":\"#000000\",\"backgroundOpacity\":100,\"textAlign\":\"center\",\"textAlignVertical\":\"middle\"}}}}}');
})

test('verify handleSingleExampleMethod works for call with error in response', () => {
  let staticObject = {};
  staticObject["methods"] = 'appcatalog.apps';
  let obj;
  const session = new sessionManagement.Session();
  const result = session.handleSingleExampleMethod(singleExampleArray, staticObject, 'appcatalog.apps', obj, 1);
  expect(JSON.stringify(result)).toMatch('{\"methods\":{\"appcatalog.apps\":{\"result\":{\"error\":{\"code\":-32601,\"message\":\"Method not found\"},\"timestamp\":1663091851797}}}}');
})

test('verify handleSingleExampleMethod works for missing Response', () => {
  let staticObject = {};
  staticObject["methods"] = 'discovery.policy';
  let obj;
  const session = new sessionManagement.Session();
  const result = session.handleSingleExampleMethod(singleExampleArray, staticObject, 'discovery.policy', obj, 2);
  expect(JSON.stringify(result)).toMatch('{\"methods\":{\"discovery.policy\":{}}}');
})


test('verify handleSingleExampleMethod works for false result', () => {
  let staticObject = {};
  staticObject["methods"] = 'discovery.policy';
  let obj;
  const session = new sessionManagement.Session();
  const result = session.handleSingleExampleMethod(singleExampleArray, staticObject, 'discovery.policy', obj, 3);
  expect(JSON.stringify(result)).toMatch('{\"methods\":{\"discovery.policy\":{\"result\":false}}}');
})

test('verify handleSingleExampleMethod works for Cert Error', () => {
  let staticObject = {};
  staticObject["methods"] = 'authentication.token';
  let obj;
  const session = new sessionManagement.Session();
  const result = session.handleSingleExampleMethod(singleExampleArray, staticObject, 'authentication.token', obj, 4);
  expect(JSON.stringify(result)).toMatch('{\"methods\":{\"authentication.token\":{\"result\":null}}}');
})

test('verify convertJsonToYml works for multiple method calls', () => {
  const session = new sessionManagement.Session();
  const input = '{"sessionStart":1663165159924,"sessionEnd":1663165214534,"calls":[{"methodCall":"advertising.config","params":{"options":{"environment":"prod","authenticationEntity":"MVPD"}},"timestamp":1663165186358,"sequenceId":5,"response":{"result":{"adServerUrl":"http://demo.v.fwmrm.net/ad/p/1","adServerUrlTemplate":"http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D","adNetworkId":"519178","adProfileId":"12345:caf_allinone_profile","adSiteSectionId":"caf_allinone_profile_section","adOptOut":true,"privacyData":"ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K","ifaValue":"01234567-89AB-CDEF-GH01-23456789ABCD","ifa":"ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==","appName":"FutureToday","appBundleId":"FutureToday.comcast","distributorAppId":"1001","deviceAdAttributes":"ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=","coppa":0,"authenticationEntity":"60f72475281cfba3852413bd53e957f6"},"timestamp":1663165189721}},{"methodCall":"advertising.config","params":{"options":{"coppa":false,"environment":"prod","authenticationEntity":"MVPD"}},"timestamp":1663165187952,"sequenceId":6,"error":{"code":"CertError","message":"Received response as undefined"}},{"methodCall":"advertising.config","params":{"options":{"coppa":true,"environment":"prod","authenticationEntity":"MVPD"}},"timestamp":1663165189718,"sequenceId":7,"response":{"result":{"adServerUrl":"http://demo.v.fwmrm.net/ad/p/1","adServerUrlTemplate":"http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D","adNetworkId":"519178","adProfileId":"12345:caf_allinone_profile","adSiteSectionId":"caf_allinone_profile_section","adOptOut":true,"privacyData":"ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K","ifaValue":"01234567-89AB-CDEF-GH01-23456789ABCD","ifa":"ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==","appName":"FutureToday","appBundleId":"FutureToday.comcast","distributorAppId":"1001","deviceAdAttributes":"ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=","coppa":0,"authenticationEntity":"60f72475281cfba3852413bd53e957f6"},"timestamp":1663165189721}},{"methodCall":"advertising.config","params":{"options":{"coppa":true,"environment":"prod","authenticationEntity":"MVPD","anotherParam":true}},"timestamp":1663165189718,"sequenceId":7,"response":{"error":{"code":-32601,"message":"Method not found"},"timestamp":1663165189721}}]}';
  const spy = jest.spyOn(fs, "existsSync").mockImplementation(() => false);
  const spy2 = jest.spyOn(fs, "mkdirSync").mockImplementation(() => {});
  const spy3 = jest.spyOn(session, "checkParams").mockImplementation(() => false);
  const spy4 = jest.spyOn(session, "handleMultipleExampleMethod").mockImplementation(() => 'function (ctx,params){\n   if(JSON.stringify(params.options)  ===  \'{\"coppa\":false,\"environment\":\"prod\",\"authenticationEntity\":\"MVPD\"}\'){\n      return null; \n   }\n   else if(JSON.stringify(params.options)  ===  \'{\"coppa\":true,\"environment\":\"prod\",\"authenticationEntity\":\"MVPD\"}\'){\n      return {\"adServerUrl\":\"http://demo.v.fwmrm.net/ad/p/1\",\"adServerUrlTemplate\":\"http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D\",\"adNetworkId\":\"519178\",\"adProfileId\":\"12345:caf_allinone_profile\",\"adSiteSectionId\":\"caf_allinone_profile_section\",\"adOptOut\":true,\"privacyData\":\"ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K\",\"ifaValue\":\"01234567-89AB-CDEF-GH01-23456789ABCD\",\"ifa\":\"ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==\",\"appName\":\"FutureToday\",\"appBundleId\":\"FutureToday.comcast\",\"distributorAppId\":\"1001\",\"deviceAdAttributes\":\"ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=\",\"coppa\":0,\"authenticationEntity\":\"60f72475281cfba3852413bd53e957f6\"}; \n   }\n   else if(JSON.stringify(params.options)  ===  \'{\"coppa\":true,\"environment\":\"prod\",\"authenticationEntity\":\"MVPD\",\"anotherParam\":true}\'){\n      return {\"error\":{\"code\":-32601,\"message\":\"Method not found\"},\"timestamp\":1663165189721}; \n   }\n   else if(JSON.stringify(params.options)  ===  \'{\"environment\":\"prod\",\"authenticationEntity\":\"MVPD\"}\'){\n      return {\"adServerUrl\":\"http://demo.v.fwmrm.net/ad/p/1\",\"adServerUrlTemplate\":\"http://demo.v.fwmrm.net/ad/p/1?flag=+sltp+exvt+slcb+emcr+amcb+aeti&prof=12345:caf_allinone_profile &nw=12345&mode=live&vdur=123&caid=a110523018&asnw=372464&csid=gmott_ios_tablet_watch_live_ESPNU&ssnw=372464&vip=198.205.92.1&resp=vmap1&metr=1031&pvrn=12345&vprn=12345&vcid=1X0Ce7L3xRWlTeNhc7br8Q%3D%3D\",\"adNetworkId\":\"519178\",\"adProfileId\":\"12345:caf_allinone_profile\",\"adSiteSectionId\":\"caf_allinone_profile_section\",\"adOptOut\":true,\"privacyData\":\"ew0KICAicGR0IjogImdkcDp2MSIsDQogICJ1c19wcml2YWN5IjogIjEtTi0iLA0KICAibG10IjogIjEiIA0KfQ0K\",\"ifaValue\":\"01234567-89AB-CDEF-GH01-23456789ABCD\",\"ifa\":\"ewogICJ2YWx1ZSI6ICIwMTIzNDU2Ny04OUFCLUNERUYtR0gwMS0yMzQ1Njc4OUFCQ0QiLAogICJpZmFfdHlwZSI6ICJzc3BpZCIsCiAgImxtdCI6ICIwIgp9Cg==\",\"appName\":\"FutureToday\",\"appBundleId\":\"FutureToday.comcast\",\"distributorAppId\":\"1001\",\"deviceAdAttributes\":\"ewogICJib0F0dHJpYnV0ZXNGb3JSZXZTaGFyZUlkIjogIjEyMzQiCn0=\",\"coppa\":0,\"authenticationEntity\":\"60f72475281cfba3852413bd53e957f6\"}; \n   }\n   throw new ctx.FireboltError(-32888,\'advertising.config is not working\')\n}');
  const spy5 = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
  const result = session.convertJsonToYml(input);
  expect(spy).toHaveBeenCalled();
  expect(spy2).toHaveBeenCalled();
  expect(spy3).toHaveBeenCalled();
  expect(spy4).toHaveBeenCalled();
  expect(spy5).toHaveBeenCalled();
  expect(result).toBeUndefined();
  spy.mockClear();
  spy2.mockClear();
  spy3.mockClear();
  spy4.mockClear();
  spy5.mockClear();
})

test('verify convertJsonToYml handles write exception for multiple method calls', () => {
  const session = new sessionManagement.Session();
  const input = '{"sessionStart":1663165159924,"sessionEnd":1663165214534,"calls":[{"methodCall":"advertising.config","params":{"options":{"coppa":false,"environment":"prod","authenticationEntity":"MVPD"}},"timestamp":1663165187952,"sequenceId":6,"error":{"code":"CertError","message":"Received response as undefined"}},{"methodCall":"advertising.config","params":{"options":{"coppa":true,"environment":"prod","authenticationEntity":"MVPD","anotherParam":true}},"timestamp":1663165189718,"sequenceId":7,"response":{"error":{"code":-32601,"message":"Method not found"},"timestamp":1663165189721}}]}';  
  const spy = jest.spyOn(fs, "existsSync").mockImplementation(() => false);
  const spy2 = jest.spyOn(fs, "mkdirSync").mockImplementation(() => {});
  const spy3 = jest.spyOn(session, "checkParams").mockImplementation(() => false);
  const spy4 = jest.spyOn(session, "handleMultipleExampleMethod").mockImplementation(() => 'function (ctx,params){\n   if(JSON.stringify(params.options)  ===  \'{\"coppa\":true,\"environment\":\"prod\",\"authenticationEntity\":\"MVPD\",\"anotherParam\":true}\'){\n      return {\"error\":{\"code\":-32601,\"message\":\"Method not found\"},\"timestamp\":1663165189721}; \n   }\n   else if(JSON.stringify(params.options)  ===  \'{\"coppa\":false,\"environment\":\"prod\",\"authenticationEntity\":\"MVPD\"}\'){\n      return null; \n   }\n   throw new ctx.FireboltError(-32888,\'advertising.config is not working\')\n}');
  const spy5 = jest.spyOn(fs, "writeFileSync").mockImplementation(() => new error);
  const result = session.convertJsonToYml(input);
  expect(spy).toHaveBeenCalled();
  expect(spy2).toHaveBeenCalled();
  expect(spy3).toHaveBeenCalled();
  expect(spy4).toHaveBeenCalled();
  expect(spy5).toHaveBeenCalled();
  expect(result.message).toMatch('error is not defined');
  spy.mockClear();
  spy2.mockClear();
  spy3.mockClear();
  spy4.mockClear();
  spy5.mockClear();
})

test('verify convertJsonToYml handles only duplicate method calls', () => {
  const session = new sessionManagement.Session();
  const input = '{"sessionStart":1663165159924,"sessionEnd":1663165214534,"calls":[{"methodCall":"advertising.config","params":{"options":{"coppa":true,"environment":"prod","authenticationEntity":"MVPD","anotherParam":true}},"timestamp":1663165189718,"sequenceId":7,"response":{"error":{"code":-32601,"message":"Method not found"},"timestamp":1663165189721}},{"methodCall":"advertising.config","params":{"options":{"coppa":false,"environment":"prod","authenticationEntity":"MVPD"}},"timestamp":1663165187952,"sequenceId":6,"error":{"code":"CertError","message":"Received response as undefined"}}]}';
  const spy = jest.spyOn(fs, "existsSync").mockImplementation(() => false);
  const spy2 = jest.spyOn(fs, "mkdirSync").mockImplementation(() => {});
  const spy3 = jest.spyOn(session, "checkParams").mockImplementation(() => true);
  const spy4 = jest.spyOn(session, "handleSingleExampleMethod").mockImplementation(() => '{"methods":{"advertising.config":{"result":{"error":{"code":-32601,"message":"Method not found"},"timestamp":1663165189721}}}}');
  const spy5 = jest.spyOn(fs, "writeFileSync").mockImplementation(() => new error);
  const result = session.convertJsonToYml(input);
  expect(spy).toHaveBeenCalled();
  expect(spy2).toHaveBeenCalled();
  expect(spy3).toHaveBeenCalled();
  expect(spy4).toHaveBeenCalled();
  expect(spy5).toHaveBeenCalled();
  expect(result.message).toMatch('error is not defined');
  spy.mockClear();
  spy2.mockClear();
  spy3.mockClear();
  spy4.mockClear();
  spy5.mockClear();
})

test('verify convertJsonToYml handles invalid inputs', () => {
  const session = new sessionManagement.Session();
  const input = 'Invalid Input';
  const spy = jest.spyOn(fs, "existsSync").mockImplementation(() => true);
  const result = session.convertJsonToYml(input);
  expect(spy).toHaveBeenCalled();
  expect(result.message).toMatch('Unexpected token I in JSON at position 0');
  spy.mockClear();
})

test('verify convertJsonToYml handles invalid inputs to skip', () => {
  const session = new sessionManagement.Session();
  const input = '{"sessionStart":1663165159924,"sessionEnd":1663165214534,"calls":[{"methodCall":"advertising.onChanged","params":{"options":{"coppa":true,"environment":"prod","authenticationEntity":"MVPD","anotherParam":true}},"timestamp":1663165189718,"sequenceId":7,"response":{"error":{"code":-32601,"message":"Method not found"},"timestamp":1663165189721}}]}';
  const spy = jest.spyOn(fs, "existsSync").mockImplementation(() => true);
  const result = session.convertJsonToYml(input);
  expect(spy).toHaveBeenCalled();
  expect(result).toBeUndefined();
  spy.mockClear();
})