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

import DynaForm from './DynaForm.mjs';

export default {
  name: 'Methods',
  components: { DynaForm },
  props: {},
  template: `
    <div id="methods">
      <h1>Method Overrides</h1>

      <template v-if="! meta">
        <p>Please wait...</p>
      </template>

      <template v-else>
        <div id="search">
          Filter: <input v-model="newSearch" type="text" size="20" v-on:keyup.enter="onSubmitSearch" />
          <button id="btnFilter" v-on:click="onSubmitSearch">Go</button>
        </div>

        <div v-for="method in filteredMethods" v-bind:key="method.name"
             class="method"
             v-on:click="onMethodClick(method)"
        >
          <div class="method-name">
            <template v-if="isMethodOpen(method.name)">
              <span class="expando">-</span>
            </template>
            <template v-else>
              <span class="expando">+</span>
            </template>
            {{ method.name }}
          </div>
          <p>{{ method.summary }}</p>

          <template v-if="isMethodOpen(method.name)">
            <dyna-form v-bind:methodName="method.name" v-bind:schema="schema(method.name)"></dyna-form>
          </template>
        </div>

      </template>
    </div> <!-- methods -->
  `,
  data: function() {
    return mf.state;
  },
  computed: {
    filteredMethods: function() {
      if ( ! this.search ) { return this.meta.core.methods; }

      const self = this;
      return self.meta.core.methods.filter(function(method) {
        return ( method.name.indexOf(self.search) !== -1 || method.summary.indexOf(self.search) !== -1 );
      });
    }
  },
  methods: {
    result: function(methodName) {
      if ( ! this.meta ) { return; }
      const methods = this.meta.core.methods.filter(function(method) {
        return ( method.name === methodName );
      });
      if ( ! methods || methods.length === 0 ) { return undefined; }
      const method = methods[0];
      const result = method.result;
      if ( ! result ) { return undefined; }
      return result;
    },
    schema: function(methodName) {
      const result = this.result(methodName);
      if ( ! result ) { return undefined; }
      let schema = result.schema;

      schema['$schema'] = 'http://json-schema.org/draft-07/schema#';

      return schema;
    },
    onSubmitSearch: function() {
      this.search = this.newSearch;
    },
    onMethodClick: function(method) {
      if ( this.openedMethods[method.name] ) {
        // this.openedMethods[method.name] = false;
        this.openedMethods = Object.assign({}, this.openedMethods, { [method.name]: false });
      } else {
        // this.openedMethods[method.name] = true;
        this.openedMethods = Object.assign({}, this.openedMethods, { [method.name]: true });
      }
    },
    isMethodOpen: function(methodName) {
      return ( this.openedMethods[methodName] );
    }
  }
};
