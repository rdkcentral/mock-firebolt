import icons from "../icons.mjs";
import Modal from "./Modal.mjs";

/**
 * Creating a Vue component to show modal dialog
 */
export default {
  name: "PreviewEventModal",
  components: {
    Modal
  },
  data: function() {
    return {
        icons
    };
  },
  props: {
    show: {
        type: Boolean,
        required: true,
    },
    callbacks: {
        type: Array,
        required: false,
        default: () => [],
    },
    fireboltEvent: {
        type: Object,
        required: true,
    }
  },
  template: `
        <Modal v-bind:show="show">
            <template v-slot:header>
                <div class="upload-modal-header">
                    <h1>Event preview</h1>
                    <svg v-html="icons.close" v-on:click="$emit('close')" />
                </div>
            </template>
            <template v-slot:body>
                <pre>{{ JSON.stringify(fireboltEvent, null, 2) }}</pre>
            </template>
        </Modal>
    `,
};
