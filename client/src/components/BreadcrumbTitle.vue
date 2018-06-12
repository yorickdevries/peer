<template>
    <b-breadcrumb :items="breadcrumbItems(items)"></b-breadcrumb>
</template>

<script>
    export default {
        props: {
            items: Array
        },
        name: "Breadcrumb",
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
