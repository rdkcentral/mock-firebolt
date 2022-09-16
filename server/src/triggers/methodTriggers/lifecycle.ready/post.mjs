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

function post(ctx, params) {
    ctx.setTimeout(function() {
      const result = { previous: 'initializing', state: 'inactive' }
      const msg = 'Post trigger for lifecycle.ready sent inactive lifecycle event';
      ctx.sendEvent('lifecycle.onInactive', result, msg);
    }, 500);

    ctx.setTimeout(function() {
      const result = {previous: 'inactive', state: 'foreground' }
      const msg = 'Post trigger for lifecycle.ready sent foreground lifecycle event';
      ctx.sendEvent('lifecycle.onForeground', result, msg);
    }, 1000);
  }