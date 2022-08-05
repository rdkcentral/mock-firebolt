"use strict";

import { jest } from "@jest/globals";
import * as proxyManagement from "../../src/proxyManagement.mjs";
import { WebSocket } from 'mock-socket';

beforeEach(() => {
    clearEnvs()
})

afterEach(() => {
    clearEnvs()
})

test(`proxyManagement.getProxyWSConnection works properly`, async () => {
    const client = await proxyManagement.getProxyWSConnection()
    expect(client).toBe(null);
});

test(`proxyManagement.getToken works properly and get token from request param or from env`, async () => {
    let token = proxyManagement.getToken({"url": "http://abcd.com?token=test"})
    expect(token.stdout).toBe("test");

    process.env.TOKEN = "abcd"
    token = proxyManagement.getToken(null)
    expect(token.stdout).toBe(process.env.TOKEN);
});

test(`proxyManagement.getToken works properly and when token nor present in request param and env`, async () => {
    const token = proxyManagement.getToken({"url": "http://abcd.com"})
    expect(token.stderr).toBe("Unable to get token from connection param or not present in env");
});

test(`proxyManagement.initialize works properly`, async () => {
    process.env.proxyServerIP = "localhost:40002"
    var socket = new WebSocket('ws://localhost:40002');
    socket.connected = true;
    try {
        await proxyManagement.initialize()
        //TODO validation not performed yet. Need to figure out better way to mock websocket.
    } catch (e) {
        console.log("ERROR:: ", e)
        socket.connected = false
    }
});

test(`proxyManagement.sendRequest works properly`, async () => {
    try {
        await proxyManagement.sendRequest(null)
    } catch (e) {
        expect(e.message).toBe("websocketConnection not established");
    }
});

// test(`proxyManagement.getProxyWSConnection works properly with mock`, () => {
//     console.log("in")
//     const mockTestFuncB = jest.mock();
//     console.log("in2")
//     mockTestFuncB.spyOn(proxyManagement, 'getProxyWSConnection').mockReturnValue(true);
//     console.log("in3")
//     //spy.mockReturnValue(true);
//     expect(proxyManagement.getProxyWSConnection()).toBe(true);
//     mockTestFuncB.getProxyWSConnection.mockRestore();
// });

test(`proxyManagement.close works properly`, () => {
    proxyManagement.close()
});


function clearEnvs() {
    delete process.env.TOKEN
    delete process.env.proxyServerIP
    delete process.env.proxy 
}

