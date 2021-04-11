<template>
    <b-input-group>
        <b-input-group-prepend>
            <b-button variant="outline-dark" class="py-0" size="sm" @click="valueChange(value - 0.01)">
                <b-icon icon="dash" font-scale="1.6" />
            </b-button>
        </b-input-group-prepend>
        <b-form-input
            :id="id"
            :value="value"
            type="number"
            class="text-center"
            number
            min="-1"
            max="1"
            @update="valueChange"
        />
        <b-input-group-append>
            <b-button variant="outline-dark" class="py-0" size="sm" @click="valueChange(value + 0.01)">
                <b-icon icon="plus" font-scale="1.6" />
            </b-button>
        </b-input-group-append>
    </b-input-group>
</template>

<script>
import { BIcon, BIconDash, BIconPlus } from "bootstrap-vue"

export default {
    name: "EditableSpinButton",
    components: {
        BIcon,
        /* eslint-disable vue/no-unused-components */
        BIconDash,
        BIconPlus
    },
    props: {
        id: {
            type: String,
            required: true
        },
        value: {
            type: Number,
            required: true
        }
    },
    methods: {
        valueChange(newValue) {
            this.$emit("input", this.formatter(newValue))
        },
        formatter(unformatted) {
            if (unformatted < -1) {
                return -1
            } else if (unformatted > 1) {
                return 1
            } else {
                return Math.round(unformatted * 100) / 100
            }
        }
    }
}
</script>

<style scoped>
/* Remove up and down arrows inside number input */
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Firefox */
input[type="number"] {
    -moz-appearance: textfield;
    width: 5rem;
}
</style>
