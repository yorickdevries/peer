<template>
    <div v-if="files" class="d-flex">
        <div style="flex-shrink: 0; max-width: 40%">
            <FileTree :files="files" :selectedFile="selected" @selected="onSelect" />
        </div>
        <div class="ml-3" style="overflow: hidden; flex-grow: 1; position: relative">
            <b-alert variant="primary" show v-if="!content || content.length === 0">This file is empty</b-alert>
            <CodeViewer v-else-if="readOnly" :content="content" />
            <CodeAnnotator
                v-else
                :content="content"
                :readOnly="readOnly"
                :submissionId="submissionId"
                :reviewId="reviewId"
            />
            <b-overlay :show="showWarning || !showFile" :opacity="1" no-fade no-wrap>
                <template #overlay>
                    <b-spinner v-if="!showFile" variant="primary"></b-spinner>
                    <div v-else-if="showWarning" class="text-center">
                        <p>This file contains characters that can not be displayed properly</p>
                        <b-button variant="outline-primary" @click="showWarning = false">Show anyway</b-button>
                    </div>
                </template>
            </b-overlay>
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
    props: ["fileUrl", "readOnly", "submissionId", "reviewId"],
    components: { CodeViewer, FileTree, CodeAnnotator },
    data() {
        return {
            content: null,
            files: null,
            selected: null,
            showWarning: false,
            showFile: false
        }
    },
    methods: {
        async getFile() {
            return await fetch(this.fileUrl)
                .then(res => res.blob())
                .catch(console.error)
        },
        async highlightContent(text) {
            // hljs.highlightAuto expects a string (code) and optionally an array
            // of language names / aliases
            const highlighted = hljs.highlightAuto(text)
            this.content = highlighted.value.split(/\r?\n/g)
            this.showFile = true
        },
        async loadZip(file) {
            JSZip.loadAsync(file)
                .then(zip => {
                    return (
                        Object.keys(zip.files)
                            .map(name => zip.file(name))
                            // Filter out all null files
                            .filter(file => file)
                    )
                })
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
        async onSelect(file) {
            if (file != this.selected) {
                this.showFile = false
                // A regular expression to match any `Special` characters
                const specials = /[\u{FFF9}\u{FFFA}\u{FFFB}\u{FFFC}\u{FFFD}\u{FFFE}\u{FFFF}]/gu
                this.selected = file
                this.files
                    .find(f => !f.dir && f.name === file)
                    .async("string")
                    .then(text => {
                        this.showWarning = text.match(specials) !== null
                        this.highlightContent(text)
                    })
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
