"use strict";

import { jest } from "@jest/globals";
import * as proxyManagement from "../../src/proxyManagement.mjs";

jest.setTimeout(80 * 1000)
describe('sequentially run tests', () => {

    beforeAll(() => {
        clearEnvs()     
    })

    afterAll(() => {
        clearEnvs()
    })

    test(`proxyManagement.getMFToken works properly and get token from request param or from env`, async () => {
        let token = proxyManagement.getMFToken({"url": "http://abcd.com?token=test"})
        expect(token.token).toBe("test");

        process.env.MF_TOKEN = "abcd"
        token = proxyManagement.getMFToken(null)
        expect(token.token).toBe(process.env.MF_TOKEN);
    });

    test(`proxyManagement.getToken works properly and when token nor present in request param and env`, async () => {
        delete process.env.MF_TOKEN
        const token = proxyManagement.getMFToken({"url": "http://abcd.com"})
        expect(token.error).toBe("Unable to get token from connection param or not present in env");
    });

    test(`proxyManagement.actOnResponseObject works properly with mock`, async () => {
        const data = {"jsonrpc":"2.0","id":1,"result":{"type":"device","value":"<XACT Token>"}}
        proxyManagement.actOnResponseObject(JSON.stringify(data), null)
        const res = await proxyManagement.getResponseMessageFromProxy(data.id)
        expect(res).toBe(JSON.stringify(data))
    })

    test(`Handle error when url not passed`, async () => {
        delete process.env.proxyServerIP
        proxyManagement.initialize(null, null).catch(function (err) {
            // Only executed if rejects the promise
            expect(err.toString()).toContain('Error: ERROR: Proxy Url not found in env')
        });
        
    })

    test(`proxyManagement.sendRequest works properly`, async () => {
        proxyManagement.sendRequest(null)
    })

    test(`proxyManagement.initialize works properly`, async () => {
        try {
            process.env.proxyServerIP = "localhost.test"
            const response = await proxyManagement.initialize(proxyManagement.actOnResponseObject, null)
            console.log("response: ", response)
        } catch (e) {
            expect(e.errno).toBe(-3008);
            expect(e.code).toBe("ENOTFOUND");
        }
    });
})

function clearEnvs() {
    delete process.env.MF_TOKEN
    delete process.env.proxyServerIP
    delete process.env.proxy
}