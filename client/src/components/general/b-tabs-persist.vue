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
            mounted: false,
            tabIndex: 0,
        }
    },
    methods: {
        setTab(index) {
            if (this.mounted) {
                location.hash = index
            }
        },
    },
    mounted() {
        const index = parseInt(location.hash.substring(1))
        this.$nextTick(() => {
            if (!isNaN(index)) {
                this.tabIndex = index
            }
            this.mounted = true
        })
    },
}
</script>
