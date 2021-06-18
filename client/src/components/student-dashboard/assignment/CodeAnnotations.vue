<template>
    <pre ref="container"><div class="code-annotations-wrapper">
            <div
                class="code-annotations-line"
                v-for="(line, index) in content"
                :key="index + 'code'"
            >
                <div class="position-relative d-flex">
                    <div class="gutter sticky-left">
                        <code
                            class="code-annotations-linenr"
                            :style="{
                                width: `${maxLineNumberDigits}ch`
                            }"
                        >{{ index + 1 }}</code>
                        <div class="review-bar">
                            <span
                                v-for="review in reviewsInFile"
                                :key="index + 'review_' + review"
                                :style="{
                                    'border-left-color': filterAnnotationsAt(index, false, false, review).length > 0
                                        ? reviewColors[review]
                                        : 'transparent'
                                }"
                            ></span>
                        </div>
                    </div>
                    <code
                        v-if="!hasAnnotationsAt(index)"
                        :linenr="index + 1"
                        class="code-annotations-code"
                        :class="{
                            selection: hasSelectionAt(index),
                            selection_start: hasSelectionStartingAt(index),
                            selection_end: hasSelectionEndingAt(index)
                        }"
                        v-html="line.replace(/^$/, '<br />')"
                    ></code><code
                        v-else
                        :linenr="index + 1"
                        :class="{
                            annotation: true,
                            annotation_start: hasAnnotationsStartingAt(index),
                            annotation_end: hasAnnotationsEndingAt(index)
                        }"
                        v-html="line.replace(/^$/, '<br />')"
                        role="button"
                        @click="toggleAnnotationsAt(index)"
                    ></code>
                    <div
                        v-if="hasAnnotationsStartingAt(index)"
                        class="arrow code-annotations-icon-button"
                        :class="{ rotate: getAnnotationsStartingAt(index).every(annotation => annotationState[annotation.id] === true) }"
                        role="button"
                        tabindex="0"
                        @click="toggleAnnotationsAt(index)"
                        @keydown.enter.space="toggleAnnotationsAt(index)"
                        @keydown.space.prevent
                        aria-expanded="false"
                        :aria-controls="`annotation_${index + 1}`"
                        :ref="`chevron_${index + 1}`"
                    ><icon name="chevron-down" /></div>
                </div>
                <div 
                    v-for="annotation of getAnnotationsEndingAt(index)"
                    :key="annotation"
                    class="annotation-container sticky-left"
                    :style="{
                        width: $refs.container ? `${$refs.container.clientWidth}px` : `auto`
                    }"
                >
                    <div class="gutter">
                        <code
                            class="code-annotations-linenr"
                            :style="{
                                width: `${maxLineNumberDigits}ch`
                            }"
                        ></code>
                        <div class="review-bar">
                            <span
                                v-for="review in reviewsInFile"
                                :key="index + 'review_' + review"
                                :style="{
                                    'border-left-color': review === annotation.reviewId
                                        ? reviewColors[review]
                                        : 'transparent'
                                }"
                            ></span>
                        </div>
                    </div>
                    <b-collapse
                        v-model="annotationState[annotation.id]"
                        :id="`annotation_${annotation.startLineNumber}`"
                    >
                        <b-card>
                            <div v-if="editingAnnotation !== null && editingAnnotation.endLineNumber === index + 1">
                                <PeerTextarea
                                    placeholder="Type your annotation"
                                    rows="3"
                                    max-rows="5"
                                    @submit="(text) => submitAnnotation(annotation, text)"
                                    @cancel="cancelEdit"
                                    :maxLength="maxAnnotationLength"
                                    :defaultLanguage="language"
                                    :defaultContent="unescapeHTML(annotation.annotationText)"
                                />
                            </div><div v-else class="d-flex">
                                <span class="annotation-text" v-html="highlightAnnotation(annotation.annotationText)"></span>
                                <div v-if="!readOnly" style="flex-shrink: 0">
                                    <div
                                        class="mx-1 text-primary code-annotations-icon-button"
                                        role="button" 
                                        v-b-modal="`editModal_${annotation.id}`"
                                        tabindex="0"
                                        @click="editAnnotation(annotation)"
                                        @keydown.enter.space="editAnnotation(annotation)"
                                        @keydown.space.prevent
                                    ><icon name="pen" /></div>
                                    <b-modal 
                                        :id="`editModal_${annotation.id}`" 
                                        @ok="editModalOk(index)"
                                        variant="danger"
                                        title="Warning!"
                                        v-if="showEditModal"
                                        centered>
                                        {{ getModalText() }}
                                    </b-modal>
                                    <div
                                        class="text-danger code-annotations-icon-button"
                                        role="button"
                                        v-b-modal="`modal_${annotation.id}`"
                                        tabindex="0"
                                        @keydown.space.prevent
                                    ><icon name="trash" /></div>
                                    <b-modal
                                        @ok="deleteAnnotation(annotation)"
                                        :id="`modal_${annotation.id}`"
                                        title="Confirmation"
                                        centered>
                                        Are you sure you want to delete this annotation?
                                    </b-modal>
                                </div>
                            </div>
                        </b-card>
                    </b-collapse>
                </div>
            </div>
    </div></pre>
</template>

<script>
import hljs from "highlight.js"
import "highlight.js/styles/atom-one-light.css"
import notifications from "../../../mixins/notifications"
import PeerTextarea from "./PeerTextarea"

export default {
    props: [
        "annotations",
        "content",
        "language",
        "maxAnnotationLength",
        "readOnly",
        "reviewColors",
        "selectedFile",
        "selectionStart",
        "selectionEnd",
        "isOnlyFile"
    ],
    components: { PeerTextarea },
    mixins: [notifications],
    data() {
        return {
            showEditModal: false,
            editingAnnotation: null,
            annotationState: {}
        }
    },
    created() {
        window.addEventListener("resize", () => this.$forceUpdate())
    },
    methods: {
        getAnnotationsAt(lineIndex) {
            return this.lineAnnotationMap[lineIndex.toString()] || []
        },
        hasAnnotationsAt(lineIndex) {
            return this.getAnnotationsAt(lineIndex).length > 0
        },
        hasSelectionAt(lineIndex) {
            return lineIndex + 1 >= this.selectionStart && lineIndex + 1 <= this.selectionEnd
        },
        getAnnotationsStartingAt(lineIndex) {
            return this.filterAnnotationsAt(lineIndex, true, false, -1)
        },
        hasAnnotationsStartingAt(lineIndex) {
            return this.getAnnotationsStartingAt(lineIndex).length > 0
        },
        hasSelectionStartingAt(lineIndex) {
            return lineIndex + 1 === this.selectionStart
        },
        getAnnotationsEndingAt(lineIndex) {
            return this.filterAnnotationsAt(lineIndex, false, true, -1)
        },
        hasAnnotationsEndingAt(lineIndex) {
            return this.getAnnotationsEndingAt(lineIndex).length > 0
        },
        hasSelectionEndingAt(lineIndex) {
            return lineIndex + 1 === this.selectionEnd
        },
        filterAnnotationsAt(lineIndex, startsAt = false, endsAt = false, reviewId = -1) {
            return this.getAnnotationsAt(lineIndex).filter(annotation => {
                return (
                    (!startsAt || annotation.startLineNumber - 1 === lineIndex) &&
                    (!endsAt || annotation.endLineNumber - 1 === lineIndex) &&
                    (reviewId < 0 || annotation.reviewId === reviewId)
                )
            })
        },
        escapeHTML(text) {
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#x27;")
        },
        unescapeHTML(text) {
            return text
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, '"')
                .replace(/&#x27;/g, "'")
        },
        highlightAnnotation(text) {
            const codeBlock = /(```)([^\s]*)(\s?)((?:.|\s)*?)\1/g

            return this.escapeHTML(text).replaceAll(codeBlock, (match, delimiter, language, separator, code) => {
                if (hljs.getLanguage(language)) {
                    code = hljs.highlight(this.unescapeHTML(code), { language, ignoreIllegals: true }).value
                } else {
                    code = language + separator + code
                }
                return `<code><span style="white-space: pre">${code}</span></code>`
            })
        },
        deleteAnnotation(annotation) {
            this.$emit("delete", annotation.id)
        },
        editAnnotation(annotation) {
            if (this.editingAnnotation !== null) {
                this.showEditModal = true
                return
            }
            this.editingAnnotation = annotation
        },
        submitAnnotation(annotation, updatedText) {
            this.$emit("edit", annotation.id, updatedText)
            this.cancelEdit()
        },
        cancelEdit() {
            this.editingAnnotation = null
        },
        editModalOk(lineIndex) {
            this.editingAnnotation = false
            this.editAnnotation(lineIndex)
        },
        getModalText() {
            const annotation = this.editingAnnotation
            // If there is an edit in another file, redirect the user to that file.
            if (this.selectedFile !== annotation.selectedFile) {
                return `If you start editing this annotation, your edit on file ${annotation.selectedFile} will be lost.`
            }

            // If the lines are the same, return only one line
            if (annotation.startLineNumber === annotation.endLineNumber) {
                return `If you start editing this annotation, your edit on line ${annotation.endLineNumber} will be lost.`
            } else {
                return `If you start editing this annotation, your edit between the lines ${annotation.startLineNumber} and ${annotation.endLineNumber} will be lost.`
            }
        },
        toggleAnnotationsAt(lineIndex) {
            const allExtended = this.getAnnotationsAt(lineIndex).every(
                annotation => this.annotationState[annotation.id] === true
            )
            this.getAnnotationsAt(lineIndex).forEach(annotation => {
                this.$set(this.annotationState, annotation.id, !allExtended)
            })

            //sets aria-expanded to the right value
            const annotation = this.getAnnotationsAt(lineIndex)[0]
            this.$refs[`chevron_${lineIndex + 1}`][0].$el.setAttribute(
                "aria-expanded",
                this.annotationState[annotation.id].toString()
            )
        },
        isCorrespondingFile(file) {
            return this.isOnlyFile || file === this.selectedFile
        }
    },
    computed: {
        lineAnnotationMap() {
            const result = {}
            for (let i = 0; i < this.content.length; i++) {
                const line = []
                for (let j = 0; j < this.annotations.length; j++) {
                    if (
                        this.annotations[j].startLineNumber - 1 <= i &&
                        this.annotations[j].endLineNumber - 1 >= i &&
                        this.isCorrespondingFile(this.annotations[j].selectedFile)
                    ) {
                        line.push(this.annotations[j])
                    }
                }

                if (line.length > 0) {
                    result[i.toString()] = line
                }
            }
            return result
        },
        reviewsInFile() {
            return Array.from(
                new Set(
                    this.annotations
                        .filter(annotation => this.isCorrespondingFile(annotation.selectedFile))
                        .map(annotation => annotation.reviewId)
                )
            )
        },
        maxLineNumberDigits() {
            return Math.ceil(Math.log(this.content.length + 1) / Math.log(10))
        }
    }
}
</script>

<style lang="scss" scoped>
$code-annotation-background: rgba(0, 0, 0, 0.03);
$padding-left: 1.25rem;

code,
.annotation-text::v-deep {
    background-color: inherit;
    font-family: var(--font-family-monospace);
    white-space: pre;
    display: inline-block;
    box-sizing: border-box;
    width: 100%;
}

.annotation-text {
    display: inline-block;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-all;
    white-space: pre-wrap;
    margin-right: auto;
    font-family: var(--default-font);
    font-size: initial;

    &::v-deep {
        code {
            background-color: $code-annotation-background;
            display: inline-block;
            font-size: 87.5%;

            span {
                font-family: inherit !important;
            }
        }
    }
}

pre {
    white-space: pre-line;
    display: inline-block;
    width: 100%;
    background-color: white;
    margin: 0;
    max-height: 100%;
    font-size: 87.5%;
    overflow: visible;

    .code-annotations-wrapper {
        display: flex;
        flex-direction: column;
        min-width: min-content;
        width: 100%;

        .code-annotations-line {
            flex-grow: 1;
        }
    }

    .code-annotations-wrapper,
    .code-annotations-line,
    div {
        white-space: initial;
        background-color: inherit;

        code {
            &::v-deep {
                span {
                    font-family: inherit !important;
                }
            }

            &.annotation,
            &.selection,
            &.code-annotations-code {
                padding-right: 7ch;
            }

            &.annotation,
            &.selection {
                background-color: $code-annotation-background;
                margin-right: 1ch;
            }

            &.annotation_start,
            &.annotation,
            &.annotation_end,
            &.selection {
                border-width: 1.5px;
                border-color: var(--gray);
            }

            &.annotation {
                border-style: none solid none solid;
            }

            &.selection {
                border-style: none dashed none dashed;
            }

            &.annotation_start {
                border-top-style: solid;
            }

            &.selection_start {
                border-top-style: dashed;
            }

            &.annotation_end {
                border-bottom-style: solid;
            }

            &.selection_end {
                border-bottom-style: dashed;
            }

            &.annotation_start,
            &.selection_start {
                border-top-left-radius: 3px;
                border-top-right-radius: 3px;
            }

            &.annotation_end,
            &.selection_end {
                border-bottom-left-radius: 3px;
                border-bottom-right-radius: 3px;
            }

            &.code-annotations-linenr {
                flex-shrink: 0;
                box-sizing: content-box;
                background-color: inherit;
                display: inline-block;
                text-align: right;
            }
        }

        .code-annotations-icon-button {
            background-color: transparent;
            display: inline;
            vertical-align: middle;
        }
    }
}

.arrow {
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 1;
    margin-right: 2ch;
    position: absolute;
    margin-top: auto;
    margin-bottom: auto;
    transition: transform 0.2s ease-in-out;
}

.rotate {
    transform: rotate(180deg);
}

.gutter {
    display: flex;
    border-right: 1.5px solid var(--gray);
    user-select: none;
    box-sizing: content-box;
    font-family: var(--font-family-monospace);
    margin-right: 1ch;

    .review-bar {
        font-family: inherit !important;
        display: flex;
        align-items: stretch;
        margin: 0 0.5ch;
        padding-left: 0.5ch;

        span {
            width: 0px;
            border-left-width: 0.4ch;
            border-left-style: solid;
            margin-right: 0.5ch;
            box-sizing: content-box;
            font-family: inherit !important;
        }
    }

    &::before {
        content: "";
        background: white;
        position: absolute;
        left: -$padding-left;
        top: 0;
        bottom: 0;
        width: $padding-left;
    }
}

.annotation-container {
    display: flex;

    .collapse {
        font-family: var(--font-family-monospace);
        width: 100%;
        margin-right: 1ch;
    }

    .card {
        margin: 1ch 0;
        width: 100%;
        font-family: initial;
        overflow: hidden;
    }
}

.sticky-left {
    position: sticky;
    left: 0px;
}
</style>
