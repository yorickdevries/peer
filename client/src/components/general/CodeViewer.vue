<template>
    <div>
        <pre><code style="display: block" v-for="(line, index) in content" :key="index" v-html="line"></code></pre>
    </div>
</template>

<script>
import hljs from "highlight.js"
import "highlight.js/styles/default.css"
export default {
    props: ["fileUrl"],
    data() {
        return {
            content: null
        }
    },
    created() {
        fetch(this.fileUrl)
            .then(response => response.text())
            .then(text => {
                // hljs.highlightAuto expects a string (code) and optionally an array
                // of language names / aliases
                const highlighted = hljs.highlightAuto(text)
                this.content = highlighted.value.split(/\r?\n/g)
            })
            .catch(console.warn)
    }
}
</script>
