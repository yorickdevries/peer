<template>
    <div v-if="files" class="d-flex">
        <div style="flex-shrink: 0; max-width: 40%">
            <FileTree :files="files" :selectedFile="selected" @selected="onSelect" :startCollapsed="singleFile" />
        </div>
        <div
            v-bind:class="{ 'ml-3': !singleFile }"
            v-bind:style="{
                position: 'relative',
                overflow: 'hidden',
                'flex-grow': '1'
            }"
        >
            <b-alert variant="primary" show v-if="!content || content.length === 0">This file is empty</b-alert>
            <CodeAnnotator
                v-else
                :content="content"
                :readOnly="readOnly"
                :submissionId="submissionId"
                :reviewId="reviewId"
                :selectedFile="selected"
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
import "highlight.js/styles/atom-one-light.css"
import JSZip from "jszip"
import FileTree from "./FileTree"
import CodeAnnotator from "./../student-dashboard/assignment/CodeAnnotator"
import api from "../../api/api"

export default {
    props: ["fileUrl", "readOnly", "submissionId", "reviewId"],
    components: { FileTree, CodeAnnotator },
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
            const fileExtension = this.selected.split(".").pop()
            let highlighted

            if (hljs.getLanguage(fileExtension)) {
                highlighted = hljs.highlight(text, { language: fileExtension })
            } else {
                highlighted = hljs.highlightAuto(text)
            }

            this.content = highlighted.value.split(/\r?\n/g)
            this.showFile = true
        },
        async verifyTextContent(text) {
            // A regular expression to match any `Special` characters
            const specials = /[\u{FFF9}\u{FFFA}\u{FFFB}\u{FFFC}\u{FFFD}\u{FFFE}\u{FFFF}]/gu
            this.showWarning = text.match(specials) !== null
            return text // Return text here to make chaining possible
        },
        async loadZip(file) {
            return JSZip.loadAsync(file)
                .then(zip => {
                    return (
                        Object.keys(zip.files)
                            .map(name => zip.file(name))
                            // Filter out all null files
                            .filter(file => file)
                    )
                })
                .then(files => (this.files = files))
        },
        async getSingleFileName() {
            return new Promise((resolve, reject) => {
                if (this.submissionId) {
                    resolve(api.submissions.get(this.submissionId).then(res => res.data.file))
                } else if (this.reviewId) {
                    resolve(api.reviewofsubmissions.getFileMetadata(this.reviewId).then(res => res.data))
                } else {
                    reject("Found no submission or review id")
                }
            })
                .then(file => file.name + file.extension)
                .catch(console.warn)
        },
        async loadSingleFile(file) {
            this.showFile = false
            this.selected = await this.getSingleFileName()
            this.files = [{ dir: false, name: this.selected }]

            Promise.resolve(file.text())
                .then(this.verifyTextContent)
                .then(this.highlightContent)
                .catch(console.warn)
        },
        async onSelect(file) {
            if (file != this.selected) {
                this.showFile = false
                this.selected = file
                this.files
                    .find(f => !f.dir && f.name === file)
                    .async("string")
                    .then(this.verifyTextContent)
                    .then(this.highlightContent)
                    .catch(console.warn)
            }
        }
    },
    async created() {
        const file = await this.getFile()
        const isPossibleZipFile = !file.type.includes("text/plain")

        // If we get a zip file, we'll try to unzip it and show one of the code files
        if (isPossibleZipFile) {
            this.loadZip(file).catch(() => {
                this.loadSingleFile(file)
            })
        } else {
            this.loadSingleFile(file)
        }
    },
    computed: {
        singleFile() {
            return this.files && this.files.length <= 1
        }
    }
}
</script>
