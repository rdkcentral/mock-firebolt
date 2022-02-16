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

import Header from './Header.mjs';
import Content from './Content.mjs';
import Footer from './Footer.mjs';

export default {
  name: 'App',
  components: { Header, Content, Footer },
  props: {},
  template: `
    <div id="app">
      <Header></Header>
      <p style="color:red;font-weight:bold;font-size:1.5rem;font-style:italic;margin-left:1rem;">THIS APP IS NOT YET FUNCTIONAL</p>
      <Content v-bind:meta="meta"></Content>
      <Footer></Footer>
    </div>
  `,
  data: function() {
    return mf.state;
  },
  computed: {},
  methods: {},
  mounted: function() {   
    // Load OpenRPC metadata
    const self = this;
    mf.request({
      url: `${mf.baseUrl}/api/v1/meta?dereference=true`,
      method: 'GET',
      timeout: 2000,
      fSuccess: function(data, textStatus, jqXHR) {
        // Store OpenRPC metadata in our state
        self.meta = data.meta;
      },
      fError: function(jqXHR, textStatus, errorThrown) {
        console.log('ERROR: Could not retrieve OpenRPC metadata: ' + errorThrown);
        alert('ERROR: Could not retrieve OpenRPC metadata');
      },
      dataType: 'json'
    });
  }
};
