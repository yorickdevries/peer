<template>
    <div>
        <pre><code style="display: block" v-for="(line, index) in content" :key="index" v-html="line"></code></pre>
    </div>
</template>

<script>
import hljs from "highlight.js"
import "highlight.js/styles/default.css"
import JSZip from "jszip"
export default {
    props: ["fileUrl"],
    data() {
        return {
            content: null
        }
    },
    methods: {
        async getFile() {
            return await fetch(this.fileUrl)
                .then(res => res.blob())
                .catch(console.error)
        },
        async loadZip(file) {
            JSZip.loadAsync(file)
                .then(zip => {
                    const files = Object.keys(zip.files)
                        .map(name => zip.file(name))
                        .filter(
                            file =>
                                // Filter out all null files
                                file
                        )
                        .filter(
                            file =>
                                // Filter out all files that are directories
                                !file.dir
                        )
                    // List of promises that the zip files that still need to be loaded are wrapped in
                    const listOfPromises = Promise.all(
                        files.map(async entry => {
                            const code = await entry.async("string")
                            return code
                        })
                    )
                    // Once the loading of all files is actually done, we can return their contents
                    const contents = listOfPromises.then(list => list)
                    return contents
                })
                .then(contents => {
                    // TODO: add support for multiple files
                    // Highlight the contents of the found file(s)
                    const highlighted = hljs.highlightAuto(contents[0])
                    this.content = highlighted.value.split(/\r?\n/g)
                })
                .catch(console.warn)
        },
        async loadSingleFile(file) {
            Promise.resolve(file.text())
                .then(text => {
                    // hljs.highlightAuto expects a string (code) and optionally an array
                    // of language names / aliases
                    const highlighted = hljs.highlightAuto(text)
                    this.content = highlighted.value.split(/\r?\n/g)
                })
                .catch(console.warn)
        }
    },
    async created() {
        const file = await this.getFile()
        const isZipFile = !file.type.includes("text/plain")

        // If we get a zip file, we'll try to unzip it and show one of the code files
        if (isZipFile) {
            this.loadZip(file)
        } else {
            this.loadSingleFile(file)
        }
    }
}
</script>
