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
  name: "Events",
  props: {},
  template: `
    <div id="events">
      <h1>Create Event</h1>
      <form v-on:submit.prevent="createCustomEvent" class="form">
        <div class="form_row">
          <div class="form_column">
            <div class="form_block">
              <label>Type</label>
              <select v-model="customEvent.type">
                <option v-for="eventType in eventsTypes" v-bind:key="eventType" v-bind:value="eventType">{{ eventType }}</option>
              </select>
            </div>
              
            <div class="form_block">
              <label>Display Name</label>
              <input v-model="customEvent.displayName"></input>
            </div>
          </div>
          
         <div class="form_spacer" />

          <div class="form_column">
            <div class="form_block">
              <label>Result</label>
              <textarea v-model="customEvent.result" cols=50 rows=10 ref="jsonText" ></textarea>
            </div>
          </div>

          <div class="form_spacer" />

          <div class="form_column">
              <label>Outcome</label>
              <pre>{{ prettyFormat }}</pre>
          </div>
        </div>
      
        <div class="form_row">
          <button type="submit">Create</button>
        </div>
      </form> 
      <h1>Events</h1>
      <div v-for="(eventType, index) in eventsTypes" v-bind:key="index">
        <h2>{{ eventType }}</h2>
        <p v-for="(cliEvent, index) in cliEvents[eventType]" v-bind:key="index" v-on:click="sendSequence(cliEvent)">{{ cliEvent.displayName || cliEvent.method }}</p>
      </div>
    </div>
  `,
  data: function () {
    return {
      ...mf.state,
      cliEvents: [],
      customEvent: {},
    };
  },
  computed: {
    prettyFormat: function () {
      return JSON.stringify(this.customEvent, null, 2);
    },
    eventsTypes() {
      return Object.keys(this.cliEvents);
    },
  },
  created: function () {
    this.getCliEvents();
  },
  methods: {
    createCustomEvent: async function () {
      const customEvent = await fetch("/api/v1/create-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.customEvent),
      });

      if (customEvent.status === 200) {
        this.customEvent = {};
        this.cliEvents = [];
        this.getCliEvents();
      }
    },
    getCliEvents: async function () {
      const response = await fetch("/api/v1/firebolt-events");
      const parsedResponse = await response.json();
      this.cliEvents = parsedResponse.data;
    },
    sendSequence: async function (sequence) {
      const sequenceClone = JSON.parse(JSON.stringify(sequence));
      sequenceClone.displayName = undefined;

      await fetch("/api/v1/send-sequence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ event: sequenceClone }),
      });
    },
  },
};
