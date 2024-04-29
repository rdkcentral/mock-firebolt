/**
 * Creating a Vue component to show modal dialog
 */
export default {
  name: "Modal",
  template: `
        <transition name="modal">
            <div class="modal-mask"
                v-if="show">
                <div class="modal-container">
                    <div class="modal-header">
                        <slot name="header">
                            <h1>Default header</h1>
                        </slot>
                    </div>
                    <div class="modal-body">
                        <slot name="body">
                            <p>default body</p>
                        </slot>
                    </div>
                    <div v-if="$slots.footer" class="modal-footer">
                        <slot name="footer">
                            <p>default footer</p>
                        </slot>
                    </div>
                </div>
            </div>
        </transition>
    `,
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
};
