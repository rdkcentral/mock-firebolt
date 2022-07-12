"use strict";
import { jest } from "@jest/globals";
import * as userManagement from "../../src/userManagement.mjs";



test("getUser working properly", () => {
  const expectedResult = ["12345"];
  const result = userManagement.getUsers();
  expect(result).toEqual(expect.arrayContaining(expectedResult));
});

test("userManagement.isKnownUser working properly", () => {
  const dummyArray=["12345",'67895'] 
  const expectedResult = [true,false];
  dummyArray.forEach((userId,index)=>{
   const result = userManagement.isKnownUser(userId);
   expect(result).toBe(expectedResult[index]);
  })
});

test("userManagement.getWssForUser working properly", () => {
 const dummyArray=["12345",'67895'] 
 const expectedResult = ['{"_events":{},"_eventsCount":1,"clients":{},"_shouldEmitClose":false,"options":{"maxPayload":104857600,"skipUTF8Validation":false,"perMessageDeflate":false,"handleProtocols":null,"clientTracking":true,"verifyClient":null,"noServer":true,"backlog":null,"server":null,"host":null,"path":null,"port":null},"_state":0}',undefined];
 dummyArray.forEach ((userId,index)=>{
   const result = JSON.stringify(userManagement.getWssForUser(userId));
   if (userManagement.isKnownUser(userId)) {
      expect(result).toBe(expectedResult[index]);
    } else expect(result).toBeUndefined();
  })
});


test("userManagement.getWsForUser working properly", () => {
   const userId='12345';
  const result = userManagement.getWsForUser(userId);

    expect(result).toBeUndefined();

});

test("userManagement.addUser working properly", () => {
   const userId='12345';
  expect(userManagement.addUser(userId)).toBeUndefined();
});
test('userManagement.removeUser working properly', () => { 
   const userId='12345';
   const spy=jest.spyOn(Map.prototype,'delete');
   userManagement.removeUser(userId);
   expect(spy).toHaveBeenCalled();

 })
