<template>
    <div>
        <VuePdfEmbed :source="this.fileUrl" style="display: inline-block; width: 100%"></VuePdfEmbed>
    </div>
</template>

<script>
import VuePdfEmbed from "vue-pdf-embed/dist/vue2-pdf-embed"
//style="display: inline-block; width: 100%"
export default {
    components: {
        VuePdfEmbed,
    },
    props: ["fileUrl"],
    data() {
        return {
            src: null,
            numPages: undefined,
        }
    },
}
</script>
