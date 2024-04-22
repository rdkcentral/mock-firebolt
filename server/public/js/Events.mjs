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

import icons from './icons.mjs';

export default {
  name: "Events",
  props: {},
  template: `
    <div id="events">
      <div class="left-column">
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

      <!-- ******* right column ******* -->
      <div class="right-column">
        <input v-model="sequenceName" class="new_sequence"/>

        <div class="sequence-section">
          <p v-if="sequence.length === 0">No events in the sequence. Start dragging events in</p>
          <div v-for="(sequence_event, index) in sequence" :data-index="index" v-bind:key="index" class="sequence-event" draggable="true" v-on:dragstart="(event) => handleDragStart(event, index)" v-on:dragover.prevent>
            <div data-type="prev" :data-id="index" v-on:dragover="(event) => handleDragOver(event, index)" v-on:dragleave="(event) => handleDragLeave(event, index)" v-on:drop="(event) => handlePrevNextDrop(event, index)"/>
            <p class="sequence-tag" v-on:drop="(event) => handleDragDrop(event, index)">{{ sequence_event.displayName || sequence_event.method }}</p>
            <div data-type="next" :data-id="index" v-on:dragover="(event) => handleDragOver(event, index)" v-on:dragleave="(event) => handleDragLeave(event, index)" v-on:drop="(event) => handlePrevNextDrop(event, index)"/>
          </div>
        </div>

        <div v-if="sequence.length > 0" class="sequence_actions">
          <button v-on:click="exportSequence">
            <svg v-html="icons.export" />
          </button>
          <button v-on:click="importSequence">
            <svg v-html="icons.upload" />
          </button>
          <button :disabled="sequence.length === 0" v-on:click="saveSequence">
            <svg v-html="icons.save" />
          </button>
          <button v-on:click="sequence = []">
            <svg v-html="icons.clear" />
          </button>
          <button v-on:click="sendSequence">
            <svg v-html="icons.play" />
          </button>
        </div>
        

        <!--
          <h1>Stored sequences</h1>
          <div class="sequences">
            <div v-for="(sequence, index) in sequences" v-bind:key="index">
              <p v-on:click="(_) => handleSequenceClick(sequence)">{{ sequence.name }}</p>
            </div>
            <button v-on:click="sequence = sequence.sequence">Load sequence</button>
          </div>
        -->
      </div>
    </div>
  `,
  data: function () {
    return {
      icons: icons,
      ...mf.state,
      sequenceName: "Current sequence name",
      sequence: [],
      sequences: [],
      cliEvents: [],
      customEvent: {
        type: "",
        rest: {},
      },
    };
  },
  watch: {
    "customEvent.type": {
      handler: function (value) {
        if (
          value === "accessibility" ||
          value === "account" ||
          value === "device" ||
          value === "discovery"
        ) {
          this.customEvent.rest = {
            methods: {
              [`${value}.<method>`]: {
                result: {},
              },
            },
            method: `${value}.<method>`,
            result: {},
          };
        } else if (value === "lifecycle" || value === "localization") {
          this.customEvent.rest = {
            result: {},
            method: "lifecycle.<method>",
          };
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
    this.getSequences();
    this.getCliEvents();
  },
  methods: {
    handlePrevNextDrop(event, index) {
      event.preventDefault();
      event.target.style.backgroundColor = "transparent";
      const isPrev = event.target.dataset.type === "prev";
      const tempSequence = JSON.parse(JSON.stringify(this.sequence));

      const droppedItemIndex = Number(
        event.dataTransfer.getData("dragged_item_index")
      );
      const droppedItem = tempSequence[droppedItemIndex];
      const isNewIndexGreaterThanDroppedIndex = index > droppedItemIndex;

      if (isPrev) {
        tempSequence.splice(index, 0, droppedItem);
      } else {
        tempSequence.splice(index + 1, 0, droppedItem);
      }

      tempSequence.splice(
        isNewIndexGreaterThanDroppedIndex
          ? droppedItemIndex
          : droppedItemIndex + 1,
        1
      );

      this.sequence = tempSequence;
    },
    handleDragOver(event, index) {
      event.preventDefault();
      event.target.style.backgroundColor = "green";
    },
    handleDragLeave(event, index) {
      event.preventDefault();
      event.target.style.backgroundColor = "transparent";
    },
    checkIfEventIsInSequence(cliEvent) {
      console.log(
        "🚀 ~ checkIfEventIsInSequence ~ this.sequence:",
        this.sequence
      );
      return this.sequence.some(
        (sequence) => JSON.stringify(sequence) === JSON.stringify(cliEvent)
      );
    },
    handleDragStart(event, index) {
      event.dataTransfer.setData("dragged_item_index", index);

      let dragImage = event.target.cloneNode(true);
      dragImage.classList.add("sequence_item_ghost-image");

      // dragImage.style.transform = "scale(0.5)";
      document.body.appendChild(dragImage);
      event.dataTransfer.setDragImage(dragImage, 0, 0);

      // Remove the drag image from the DOM after a short delay
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    },

    handleDragDrop(event, index) {
      document.body.style.cursor = "default";
      const droppedItemIndex = Number(
        event.dataTransfer.getData("dragged_item_index")
      );

      let tempSequence = JSON.parse(JSON.stringify(this.sequence));
      let temp = tempSequence[index];
      tempSequence[index] = tempSequence[droppedItemIndex];
      tempSequence[droppedItemIndex] = temp;

      this.sequence = tempSequence;
    },
    handleSequenceClick(sequence) {
      this.sequence = JSON.parse(JSON.stringify(sequence.sequence));
    },
    updateRest(value) {
      try {
        this.customEvent.rest = JSON.parse(value);
      } catch (error) {}
    },
    handleTextAreaUpdate(event) {
      this.updateRest(event.target.value);
    },
    updateSequence(cliEvent) {
      if (this.checkIfEventIsInSequence(cliEvent)) {
        this.sequence = this.sequence.filter(
          (sequence) => JSON.stringify(sequence) !== JSON.stringify(cliEvent)
        );
      } else {
        this.sequence.push(cliEvent);
      }
    },
    createCustomEvent: async function () {
      let requestPayload = JSON.parse(JSON.stringify(this.customEvent));

      requestPayload = {
        ...requestPayload,
        ...requestPayload.rest,
      };

      requestPayload.rest = undefined;

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
    getSequences: async function () {
      const response = await fetch("/api/v1/sequences");
      const parsedResponse = await response.json();
      this.sequences = parsedResponse.data;
    },
    saveSequence: async function () {
      const response = await fetch("/api/v1/save-sequence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sequenceName: this.sequenceName,
          sequence: this.sequence,
        }),
      });

      if (response.status === 200) {
        this.getSequences();
      }
    },
    sendSequence: async function () {
      const sequenceClone = JSON.parse(JSON.stringify(this.sequence));
      const payload = [];

      for (const event of sequenceClone) {
        event.displayName = undefined;

        payload.push({ event: event });
      }

      await fetch("/api/v1/send-sequence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    },
    exportSequence: async function () {
      const sequenceClone = JSON.parse(JSON.stringify(this.sequence));
      const fileName = 'Exported sequence'
      const blob = new Blob([JSON.stringify(sequenceClone, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      
      a.href = url;
      a.download =  fileName;
      a.click();
      URL.revokeObjectURL(url);
    },

    importSequence: async function () {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = async (event) => {
          const sequence = JSON.parse(event.target.result);
          this.sequence = sequence;
        };
        reader.readAsText(file);
      };
      input.click();
    },
  },
};
