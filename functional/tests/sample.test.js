import {expect, jest, test} from '@jest/globals';
import utilities from './utilities.mjs'

beforeEach(async () => {
  //Will throw rejected promise if failure
  console.log(await utilities.mfState(false))
})

test(`MF Startup/Health Check`, async () => {
  //Will throw rejection error if failure
  await utilities.mfState(true)

  let healthCheckResponse = utilities.callApi('/api/v1/healthcheck')

  expect(healthCheckResponse).toBeDefined()
  expect(healthCheckResponse.status).toBe(200)
});