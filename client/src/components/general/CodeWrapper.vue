<template>
    <div v-if="files" class="d-flex">
        <div style="flex-shrink: 0; max-width: 40%">
            <FileTree
                @selected="onSelect"
                :commentedFiles="commentedFiles"
                :files="files"
                :selectedFile="selected"
                :startCollapsed="singleFile"
            />
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
                :comments="comments"
                :content="content"
                :readOnly="readOnly"
                :review="review"
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
import api from "../../api/api"
import hljs from "highlight.js"
import "highlight.js/styles/default.css"
import JSZip from "jszip"
import FileTree from "./FileTree"
import CodeAnnotator from "./../student-dashboard/assignment/CodeAnnotator"

export default {
    props: ["fileUrl", "readOnly", "reviewId"],
    components: { FileTree, CodeAnnotator },
    data() {
        return {
            comments: [],
            content: null,
            files: null,
            selected: null,
            showWarning: false,
            showFile: false,
            review: null
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
        await this.fetchReview()
        await this.fetchComments()
    },
    methods: {
        async fetchReview() {
            if (this.reviewId) {
                const res = await api.reviewofsubmissions.get(this.reviewId)
                this.review = res.data
            }
        },
        async fetchComments() {
            if (this.review) {
                try {
                    const res = await api.codeannotations.getAnnotations(this.review.id)
                    const rows = res.data
                    for (const row of rows) {
                        this.comments.push(row)
                    }
                } catch (error) {
                    console.error(error)
                }
            }
        },
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
        async loadSingleFile(file) {
            this.showFile = false
            this.selected = "file"
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
    computed: {
        singleFile() {
            return this.files && this.files.length <= 1
        },
        commentedFiles() {
            return new Set(this.comments.map(comment => comment.selectedFile))
        }
    }
}
</script>
