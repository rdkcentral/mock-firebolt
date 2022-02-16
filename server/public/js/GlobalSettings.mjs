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

export default {
  name: 'GlobalSettings',
  props: {},
  template: `
    <div id="global-settings">
      <h1>Global Settings</h1>
      <div class="row mb-3">
        <label for="inputMode" class="col-sm-2 col-form-label">Mode:</label>
        <div class="col-sm-10">
          <input id="inputMode" type="text" class="form-control" value="DEFAULT">
        </div>
      </div>

      <div class="row mb-3">
        <label for="inputLatencyMin" class="col-sm-2 col-form-label">Latency:</label>
        <div class="col-sm-10">
          <div class="row mb-3">
            <label for="inputLatencyMin" class="col-sm-2 col-form-label">Min:</label>
            <div class="col-sm-10">
              <input id="inputLatencyMin" type="text" class="form-control" size="3" value="0">
            </div>
          </div>
          <div class="row mb-3">
            <label for="inputLatencyMax" class="col-sm-2 col-form-label">Max:</label>
            <div class="col-sm-10">
              <input id="inputLatencyMax" type="text" class="form-control" size="3" value="0">
            </div>
          </div>
        </div>
      </div>
    </div> <!-- #global -->
  `,
  data: function() {
    return mf.state;
  },
  computed: {},
  methods: {}
};
