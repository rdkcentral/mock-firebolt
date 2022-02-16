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
  name: 'Home',
  props: {},
  template: `
    <div id="home">
      <h1>Welcome</h1>
      <p>
        Welcome to the Mock Firebolt Control Plane Web Administrative Console.
        Here, you can do things like:
        <ul>
          <li>Set responses for various Firebolt methods</li>
          <li>Send Firebolt events</li>
          <li>Set various global settings such as latency settings</li>
          <li>Set "scratch" key-value values, which can be used to share data between method override functions</li>
        </ul>
      </p>
    </div>
  `,
  data: function() {
    return mf.state;
  },
  computed: {},
  methods: {}
};
