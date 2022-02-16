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

import FormSchema from 'https://cdn.jsdelivr.net/npm/@formschema/native@2.0.0-beta.6/dist/FormSchema.esm.min.js';

// @TODO: Should model also come in as a prop?

export default {
  name: 'DynaForm',
  components: { FormSchema },
  props: {
    methodName: String,
    schema: Object
  },
  template: `
    <div class="dyna-form container mb-3 mt-3">

      <form-schema :schema="schema" :descriptor="descriptor" v-model="model" @submit.prevent="submit">
        <button type="submit">Save</button>
      </form-schema>

    </div>
  `,
  data() {
    return {
      appState: mf.state,
      model: {}
    };
  },
  computed: {
    descriptor: function() {
      // See https://github.com/formschema/native#labels-translation
      let desc;

      // @TODO
      if ( this.schema.type !== 'object' ) {
        desc = {
          label: `${this.methodName} (type: ${this.schema.type})`,
          helper: `Enter ${this.schema.type} value for ${this.methodName} response`
        };
      } else {
        desc = {};
        desc.properties = {};
        for ( const propName in this.schema.properties ) {
          const prop = this.schema.properties[propName];
          desc.properties[propName] = {
            label: `${propName} (type: ${prop.type})`,
            helper: prop.description
          };
        }
      }
      return desc;
    }
  },
  methods: {
    submit: function() {
      console.log('@TODO: submit clicked');
    }
  }
};