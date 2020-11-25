<template>
    <div>
        <pdf v-for="i in numPages" :key="i" :src="src" :page="i" style="display: inline-block; width: 100%"></pdf>
    </div>
</template>

<script>
import pdf from "vue-pdf"
export default {
    components: {
        pdf
    },
    props: ["fileUrl"],
    data() {
        return {
            src: null,
            numPages: undefined
        }
    },
    mounted() {
        this.src = pdf.createLoadingTask(this.fileUrl)
        this.src.promise.then(pdf => {
            this.numPages = pdf.numPages
        })
    }
}
</script>
