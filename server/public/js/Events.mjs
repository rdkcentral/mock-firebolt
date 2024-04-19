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
              <option disabled value="">Select the type</option>
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
              <label>Rest</label>
              <textarea v-on:change="handleTextAreaUpdate" :value="JSON.stringify(this.customEvent.rest, null, 2)" cols=50 rows=10 ></textarea>
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

      <br />
      <br />
      
      <h1>Current Sequence</h1>

      <div class="sequence">
        <div v-for="(sequence_event, index) in sequence" v-bind:key="index" class="sequence_event" draggable="true" v-on:dragstart="(event) => handleDragStart(event, index)" v-on:drop="(event) => handleDragDrop(event, index)" v-on:dragover.prevent>
          <p>{{ sequence_event.displayName || sequence_event.method }}</p>
          <span v-if="index !== sequence.length - 1"> -> </span>
        </div>
      </div>
      <button v-on:click="sendSequence">Send sequence</button>
      <button v-on:click="sequence = []">Clear sequence</button>

      <h1>Events list</h1>

      <p>Select from the lists below which events you want to include in the sequence. The oreder of the selected events will reflect the order
      in which the events will be sent</p>

      <div class="events_list">
        <div v-for="(eventType, index) in eventsTypes" v-bind:key="index">
          <h2>{{ eventType }}</h2>
          <div class="events_wrapper">
            <div v-for="(cliEvent, index) in cliEvents[eventType]" v-bind:key="index">
              <input type="checkbox" :checked="checkIfEventIsInSequence(cliEvent)" v-on:change="updateSequence(cliEvent)">
              <label>{{ cliEvent.displayName || cliEvent.method }}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data: function () {
    return {
      ...mf.state,
      sequence: [],
      cliEvents: [],
      customEvent: {
        type: "",
        rest: {}
      },
    };
  },
  watch: {
    "customEvent.type": {
      handler: function (value) {
        if(value === "accessibility" || value === "account" || value === "device" || value === "discovery") {
          this.customEvent.rest = {
            "methods": {
              [`${value}.<method>`]: {
                "result": {}
              }
            },
            "method": `${value}.<method>`,
            "result": {}
          }
        } else if (value === "lifecycle" || value === "localization") {
          this.customEvent.rest = {
            "result": {
            },
            "method": "lifecycle.<method>"
          }
        }
      },
      deep: true,
    },
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
    checkIfEventIsInSequence(cliEvent) {
      return this.sequence.some(sequence => JSON.stringify(sequence) === JSON.stringify(cliEvent));
    },
    handleDragStart(event, index) {
      event
        .dataTransfer
        .setData('dragged_item_index', index);
    },
    handleDragDrop(event, index) {
      const droppedItemIndex = Number(event.dataTransfer.getData('dragged_item_index'));

      let tempSequence = JSON.parse(JSON.stringify(this.sequence));
      let temp = tempSequence[index];
      tempSequence[index] = tempSequence[droppedItemIndex];
      tempSequence[droppedItemIndex] = temp;

      this.sequence = tempSequence;
    },
    updateRest(value) {
      try {
        this.customEvent.rest = JSON.parse(value);
      } catch (error) {
      }
    },
    handleTextAreaUpdate(event) {
      this.updateRest(event.target.value);
    },
    updateSequence(cliEvent) {
      if(this.checkIfEventIsInSequence(cliEvent)) {
        this.sequence = this.sequence.filter(sequence => JSON.stringify(sequence) !== JSON.stringify(cliEvent));
      } else {
        this.sequence.push(cliEvent);
      }
    },
    createCustomEvent: async function () {
      let requestPayload = JSON.parse(JSON.stringify(this.customEvent));

      requestPayload = {
        ...requestPayload,
        ...requestPayload.rest
      }

      requestPayload.rest = undefined

      const customEvent = await fetch("/api/v1/create-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (customEvent.status === 200) {
        this.customEvent = {};
        this.getCliEvents();
      }
    },
    getCliEvents: async function () {
      const response = await fetch("/api/v1/firebolt-events");
      const parsedResponse = await response.json();
      this.cliEvents = parsedResponse.data;
    },
    sendSequence: async function () {
      const sequenceClone = JSON.parse(JSON.stringify(this.sequence));
      const payload = [];

      for (const event of sequenceClone) {
        event.checked = undefined;
        event.displayName = undefined;

        payload.push({event: event});
      }

      await fetch("/api/v1/send-sequence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    },
  },
};
