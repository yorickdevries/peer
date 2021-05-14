<template>
    <div v-if="files" class="d-flex">
        <div style="flex-shrink: 0; max-width: 40%">
            <FileTree :files="files" :selectedFile="selected" @selected="onSelect" />
        </div>
        <div class="ml-3" style="overflow: hidden">
            <CodeViewer v-if="readOnly" :content="content" />
            <!-- TODO: Insert code annotator here -->
            <CodeAnnotator v-else :content="content" :readOnly="readOnly" />
            <!-- TODO: Remove this when code annotator is inserted -->
            <!-- <CodeViewer v-else :content="content" /> -->
        </div>
    </div>
    <b-alert v-else show variant="primary">Loading source files</b-alert>
</template>

<script>
import hljs from "highlight.js"
import "highlight.js/styles/default.css"
import JSZip from "jszip"
import FileTree from "./FileTree"
import CodeViewer from "./CodeViewer"
import CodeAnnotator from "./../student-dashboard/assignment/CodeAnnotator"

export default {
    props: ["fileUrl", "readOnly"],
    components: { CodeViewer, FileTree, CodeAnnotator },
    data() {
        return {
            content: null,
            files: null,
            selected: null
        }
    },
    methods: {
        async getFile() {
            return await fetch(this.fileUrl)
                .then(res => res.blob())
                .catch(console.error)
        },
        highlightContent(text) {
            // hljs.highlightAuto expects a string (code) and optionally an array
            // of language names / aliases
            const highlighted = hljs.highlightAuto(text)
            this.content = highlighted.value.split(/\r?\n/g)
        },
        async loadZip(file) {
            JSZip.loadAsync(file)
                .then(zip =>
                    Object.keys(zip.files)
                        .map(name => zip.file(name))
                        // Filter out all null files
                        .filter(file => file)
                )
                .then(files => (this.files = files))
                .catch(console.warn)
        },
        async loadSingleFile(file) {
            this.selected = file.name
            this.files = [{ dir: false, name: file.name }]

            Promise.resolve(file.text())
                .then(text => this.highlightContent(text))
                .catch(console.warn)
        },
        onSelect(file) {
            if (file != this.selected) {
                this.selected = file
                this.files
                    .find(f => !f.dir && f.name === file)
                    .async("string")
                    .then(text => this.highlightContent(text))
                    .catch(console.warn)
            }
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
