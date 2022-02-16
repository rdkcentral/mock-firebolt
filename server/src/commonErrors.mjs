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

// Error Objects

// Method overrides should use "throw new ctx.FireboltError(code, msg)" if/when using the "response" key (vs. "result" or "error")
class FireboltError extends Error {
  constructor(code, message) {
    super('Firebolt error');
    this.name = 'FireboltError';
    this.code = code;
    this.message = message;
  }
}

// Thrown by Mock Firebolt if/when an attempt to set a mock value to an invalid value, per the OpenRPC specification for Firebolt
class DataValidationError extends Error {
  constructor(errors) {
    super('Invalid state data provided');
    this.name = 'DataValidationError';
    this.errors = errors;
  }
}

export {
  FireboltError, DataValidationError
}
