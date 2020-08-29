<template>
    <div class="d-flex align-items-center">
        <b-breadcrumb :items="breadcrumbItems(items)" class="w-100 shadow-sm"></b-breadcrumb>
        <div :class="{ 'ml-3': hasDefaultSlot, 'mb-3': true }">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        items: Array
    },
    computed: {
        hasDefaultSlot() {
            return !!this.$slots.default
        }
    },
    methods: {
        breadcrumbItems(items) {
            return items.map(item => {
                return {
                    text: item,
                    active: true
                }
            })
        }
    }
}
</script>
