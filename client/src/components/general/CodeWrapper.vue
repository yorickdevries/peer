<template>
    <div v-if="files">
        <b-alert v-if="readOnly" show variant="warning">
            The file is read only, so annotations cannot be added, removed or edited.
        </b-alert>
        <b-alert v-else-if="reviewSubmitted" show variant="warning">
            The review is submitted, so annotations cannot be added, removed or edited.
        </b-alert>
        <div
            v-bind:style="{
                position: 'relative',
                overflow: 'hidden'
            }"
        >
            <b-row>
                <b-alert variant="primary" show v-if="!content || content.length === 0">
                    This file is empty
                </b-alert>
            </b-row>
            <b-row>
                <b-col md="auto">
                    <FileTree
                        class="h-100"
                        @selected="onSelect"
                        :commentedFiles="commentedFiles"
                        :files="files"
                        :selectedFile="selected"
                        :startCollapsed="singleFile"
                    />
                </b-col>
                <b-col>
                    <CodeAnnotator
                        class="h-100"
                        :comments="comments"
                        :content="content"
                        :language="language"
                        :selectedFile="selected"
                        :readOnly="readOnly"
                        :review="review"
                        :reviewColors="reviewColors"
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
                </b-col>
            </b-row>
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
    props: ["fileUrl", "readOnly", "submissionId", "reviewId", "reviewColors"],
    components: { FileTree, CodeAnnotator },
    data() {
        return {
            comments: [],
            content: null,
            files: null,
            selected: null,
            showWarning: false,
            showFile: false,
            review: null,
            language: null,
            feedbackReviews: []
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
        await this.fetchFeedbackReviews()
        await this.fetchComments()
    },
    methods: {
        async fetchReview() {
            if (this.reviewId) {
                const res = await api.reviewofsubmissions.get(this.reviewId)
                this.review = res.data
            }
        },
        async fetchFeedbackReviews() {
            if (this.submissionId) {
                try {
                    const res = await api.submissions.getFeedback(this.submissionId)
                    this.feedbackReviews = res.data
                } catch (error) {
                    console.log(error)
                }
            }
        },
        async fetchComments() {
            if (this.review) {
                try {
                    const res = await api.codeannotations.getAnnotations(this.review.id)
                    this.comments.push(...res.data)
                } catch (error) {
                    console.error(error)
                }
            } else if (this.submissionId) {
                for (const review of this.feedbackReviews) {
                    const res = await api.codeannotations.getAnnotations(review.id)
                    this.comments.push(...res.data)
                }
            }
        },
        async getFile() {
            return await fetch(this.fileUrl)
                .then(res => res.blob())
                .catch(console.error)
        },
        fixMultiLineHighlighting(lines) {
            // For each line, this function finds all opening and closing span tags
            // For all opening span tags, the class name is pushed to the stack
            // For all closing span tags, the top of the stack is popped
            const spanTags = /<span.*?\\?"(.*?)\\?">|<\/span>/g
            const stack = []
            for (let i = 0; i < lines.length; i++) {
                // Add all opening span tags
                const prepend = stack.join("")

                // Go through the line, modify the stack
                ;[...lines[i].matchAll(spanTags)].forEach(match => {
                    if (match[1] === undefined) {
                        stack.pop()
                    } else {
                        stack.push(`<span class="${match[1]}">`)
                    }
                })

                // Add all closing span tags
                lines[i] = prepend + lines[i] + "</span>".repeat(stack.length)
            }

            return lines
        },
        async highlightContent(text) {
            const fileExtension = this.selected.split(".").pop()
            let highlighted

            if (hljs.getLanguage(fileExtension)) {
                highlighted = hljs.highlight(text, { language: fileExtension, ignoreIllegals: true })
            } else {
                highlighted = hljs.highlightAuto(text)
            }

            this.content = this.fixMultiLineHighlighting(highlighted.value.split(/\r?\n/g))
            this.language = highlighted.language
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
    computed: {
        singleFile() {
            return this.files && this.files.length <= 1
        },
        commentedFiles() {
            return new Set(this.comments.map(comment => comment.selectedFile))
        },
        reviewSubmitted() {
            return this.review && this.review.submitted
        }
    }
}
</script>
