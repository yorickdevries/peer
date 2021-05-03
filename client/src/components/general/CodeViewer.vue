<template>
    <div>
        <pre><code v-html="content"></code></pre>
    </div>
</template>

<script>
import hljs from "highlight.js"
import "highlight.js/styles/default.css"
export default {
    props: ["code", "ext"],
    data() {
        return {
            content: null
        }
    },
    created() {
        // hljs.highlightAuto expects a string (code) and optionally an array
        // of language names / aliases
        const highlighted = hljs.highlightAuto(this.code, [this.ext])
        this.content = highlighted.value
    }
}
</script>
