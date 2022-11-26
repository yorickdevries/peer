<template>
    <b-tabs v-model="tabIndex" v-on:input="setTab" v-bind="$attrs">
        <slot></slot>
    </b-tabs>
</template>

<script>
export default {
    name: "b-tabs-persist",
    inheritAttrs: false,
    data() {
        return {
            tabIndex: 0
        }
    },
    methods: {
        setTab(index) {
            location.hash = index
        }
    },
    mounted() {
        const index = parseInt(location.hash.substring(1))
        if (!isNaN(index)) {
            this.tabIndex = index
        }
    }
}
</script>
