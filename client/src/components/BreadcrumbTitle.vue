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
            let relLink = ""
            for (let i = items.length - 1; i >= 0; i--) {
                items[i] = {
                    text: items[i],
                    href: relLink
                }
                relLink += "../"
            }
            return items
            // return items.map(item => {
            //     return {
            //         text: item.text,
            //         href: item.link
            //     }
            // })
        }
    }
}
</script>
