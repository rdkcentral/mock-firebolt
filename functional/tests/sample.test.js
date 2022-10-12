import {expect, jest, test} from '@jest/globals';
import utilities from './utilities.mjs'

beforeEach(async () => {
  //Stop Mock Firebolt
  console.log(await utilities.mfState(false))
})

test(`MF Startup/Health Check`, async () => {
  //Will throw rejection error if failure
  await utilities.mfState(true)

  let healthCheckResponse = utilities.callApi('/api/v1/healthcheck')

  expect(healthCheckResponse).toBeDefined()
  expect(healthCheckResponse.status).toBe(200)
});

test('MF Startup -> Set override response -> Send Firebolt Command', async () => {

  //Start Mock Firebolt
  await utilities.mfState(true)

  //Tell the CLI to set an override for "account.id" method. Set response to "111"
  //await utilities.callMfCli('--method account.id --result "111"')
  //Validate the response

  //Send an "account.id" firebolt command
  //let response = utilities.fireboltCommand('{"method": "account.id"}')

  //Validate that "response" contains the override we set previously
  //assert(response).contains('111')


})