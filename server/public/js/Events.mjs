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

import icons from "./icons.mjs";
import Modal from "./components/Modal.mjs";

export default {
  name: "Events",
  components: { Modal },
  props: {},
  template: `
    <div id="events">
      <Modal v-bind:show="showModal">
        <template v-slot:header>
          <div class="upload-modal-header">
            <h1>Upload sequence</h1>
            <svg v-html="icons.close" v-on:click="showModal = false" />
          </div>
        </template>
        <template v-slot:body>
          <div class="upload-modal-body">            
            <div class="upload-sequences">
              <h1>Stored sequences</h1>
              <div class="sequences">
                <div v-for="(sequence, index) in sequences" v-bind:key="index" class="sequence-list-item">
                  <p>{{ sequence.name }}</p>
                  <div class="sequence-list-actions">
                    <svg v-html="icons.view" v-on:click="sequenceToUpload = sequence.sequence" title="Preview" />
                  </div>
                </div>
              </div>
              <div class="sequence-list-file-upload">
                <p>Upload a sequence file to load it into the sequence editor</p>
                <input type="file" v-on:change="importSequence" />
              </div>
            </div>

            <div class="upload-sequence-preview">
              <h1>Preview</h1>
              <pre>{{ JSON.stringify(sequenceToUpload, null, 2) }}</pre>
            </div>
          </div>
        </template>
        <template v-slot:footer>
          <div class="upload-sequence-actions">
            <svg v-if="Object.keys(sequenceToUpload).length > 0" v-html="icons.upload" v-on:click="handleSequenceClick(sequence)" title="Load sequence" />
          </div>
        </template>
      </Modal>

      <!-- ******* left column ******* -->
      <div class="left-column">
        <h1>Create Event</h1>
        <form v-on:submit.prevent="createCustomEvent" class="form">
          <div class="form_row">
            <div class="form-column">
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
             <hr />
              <div>
                <button type="submit">Create</button>
                <button v-on:click="exportElement(customEvent, 'event')"><svg v-html="icons.export"  />Export</button>
              </div>
            </div>
            
            <div class="form_spacer" />

            <div class="form-column">
              <div class="form_block">
                <label>Rest</label>
                <textarea v-on:change="handleTextAreaUpdate" :value="JSON.stringify(this.customEvent.rest, null, 2)" cols=35 rows=10 ></textarea>
              </div>
            </div>

            <div class="form_spacer" />

            <div class="form-column">
                <label>Outcome</label>
                <pre>{{ prettyFormat }}</pre>
            </div>
          </div>
        </form>
        <hr />
        <section class="events-list-section">
          <h1>Events list</h1>

          <p>Select from the lists below which events you want to include in the sequence. The oreder of the selected events will reflect the order
          in which the events will be sent</p>

          <div class="events-section">
            <div class="events-type-wrapper">
              <div v-for="(eventType, index) in eventsTypes" v-bind:key="index" v-on:click="selectedType = eventType">
                {{ eventType }}
              </div>
            </div>

            <div class="events-list">
              <div class="sequence-tag" v-for="(cliEvent, index) in cliEvents[selectedType]" v-bind:key="index">
                <p draggable v-on:dragstart="(event) => handleDragStartFromList(event, cliEvent)" v-on:dragover.prevent v-on:click="updateSequence(cliEvent)" >{{ cliEvent.displayName || cliEvent.method }}</p>
                <div class="event-actions">
                  <svg v-html="icons.copy" v-on:click="handleCopyEvent(cliEvent)" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- ******* right column ******* -->
      <div class="right-column">
        <input v-model="sequenceName" class="new_sequence"/>

        <div class="sequence-section">
          <p v-if="sequence.length === 0">No events in the sequence. Start dragging events in</p>
          <div v-for="(sequence_event, index) in sequence" :data-index="index" v-bind:key="index" class="sequence-event" draggable v-on:dragstart="(event) => handleDragStart(event, index)" v-on:dragover.prevent>
            <div data-type="prev" :data-id="index" v-on:dragover="(event) => handleDragOver(event, index)" v-on:dragleave="(event) => handleDragLeave(event, index)" v-on:drop="(event) => handlePrevNextDrop(event, index)"/>
            <div class="sequence-tag" v-on:drop="(event) => handleDragDrop(event, index)">
              <p>{{ sequence_event.displayName || sequence_event.method }}</p>
              <div class="event-actions">
                <svg v-html="icons.remove" v-on:click="sequence.splice(index, 1)" />
              </div>
            </div>
            <div data-type="next" :data-id="index" v-on:dragover="(event) => handleDragOver(event, index)" v-on:dragleave="(event) => handleDragLeave(event, index)" v-on:drop="(event) => handlePrevNextDrop(event, index)"/>
          </div>
        </div>

        <div class="sequence_actions">
          <button v-on:click="showModal = true" title="Upload">
            <svg v-html="icons.upload" />
          </button>
          <template v-if="sequence.length > 0">
            <button v-on:click="exportElement(sequence, 'sequence')" title="Export">
              <svg v-html="icons.export" />
            </button>
            <button :disabled="sequence.length === 0" v-on:click="saveSequence" title="Save">
              <svg v-html="icons.save" />
            </button>
            <button v-on:click="sequence = []" title="Clear">
              <svg v-html="icons.clear" />
            </button>
            <button v-on:click="sendSequence" title="Play">
              <svg v-html="icons.play" />
            </button>
          </template>
        </div>
      </div>
    </div>
  `,
  data: function () {
    return {
      showModal: false,
      icons: icons,
      ...mf.state,
      selectedType: "",
      sequenceName: "Current sequence name",
      sequence: [],
      sequenceToUpload: [],
      sequences: [],
      cliEvents: [],
      customEvent: {
        type: "",
        rest: {},
      },
    };
  },
  watch: {
    showModal: {
      handler: function (value) {
        if (!value) {
          this.sequenceToUpload = [];
        }
      }
    },
    "customEvent.type": {
      handler: function (value) {
        if (Object.keys(this.customEvent.rest).length !== 0) return;

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
    handleCopyEvent(cliEvent) {
      this.customEvent = {
        type: this.selectedType,
        displayName: cliEvent.displayName,
        rest: {
          ...cliEvent,
          displayName: undefined,
        },
      };
    },
    handlePrevNextDrop(event, index) {
      event.preventDefault();
      event.target.style.backgroundColor = "transparent";

      const isPrev = event.target.dataset.type === "prev";
      const tempSequence = JSON.parse(JSON.stringify(this.sequence));

      const droppedItemIndex = Number(
        event.dataTransfer.getData("dragged_item_index")
      );

      let droppedItem;

      if (Number.isNaN(droppedItemIndex)) {
        droppedItem = JSON.parse(event.dataTransfer.getData("dragged_item"));
      } else {
        droppedItem = tempSequence[droppedItemIndex];
      }

      if (isPrev) {
        tempSequence.splice(index, 0, droppedItem);
      } else {
        tempSequence.splice(index + 1, 0, droppedItem);
      }

      if (!Number.isNaN(droppedItemIndex)) {
        const isNewIndexGreaterThanDroppedIndex = index > droppedItemIndex;
        tempSequence.splice(
          isNewIndexGreaterThanDroppedIndex
            ? droppedItemIndex
            : droppedItemIndex + 1,
          1
        );
      }

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
      return this.sequence.some(
        (sequence) => JSON.stringify(sequence) === JSON.stringify(cliEvent)
      );
    },
    handleDragStartFromList(event, cliEvent) {
      event.dataTransfer.setData("dragged_item", JSON.stringify(cliEvent));
      event.dataTransfer.setData("dragged_item_index", null);
      this.setDragGhost(event);
    },
    handleDragStart(event, index) {
      event.dataTransfer.setData("dragged_item_index", index);

      this.setDragGhost(event);
    },
    setDragGhost(event) {
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
      let tempSequence = JSON.parse(JSON.stringify(this.sequence));
      let temp = tempSequence[index];

      const droppedItemIndex = Number(
        event.dataTransfer.getData("dragged_item_index")
      );

      if (Number.isNaN(droppedItemIndex)) {
        tempSequence[index] = JSON.parse(
          event.dataTransfer.getData("dragged_item")
        );
      } else {
        tempSequence[index] = tempSequence[droppedItemIndex];
        tempSequence[droppedItemIndex] = temp;
      }

      this.sequence = tempSequence;
    },
    handleSequenceClick() {
      this.sequence = JSON.parse(JSON.stringify(this.sequenceToUpload));
      this.showModal = false;
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

      this.selectedType = this.eventsTypes[0];
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
    exportElement: async function (element, fileName) {
      const parseElement = (JSON.parse(JSON.stringify(element)));
      const sequenceClone = parseElement.length ? parseElement : [parseElement];
      const blob = new Blob([JSON.stringify(sequenceClone, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    },
    importSequence: async function (event) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        this.sequenceToUpload = JSON.parse(event.target.result);
        // Reset input file selected file
        event.target.value = "";
      };

      reader.readAsText(file);
    },
  },
};
