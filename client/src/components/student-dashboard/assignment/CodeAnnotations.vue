<template>
    <pre ref="container"><div class="code-annotations-wrapper">
            <div
                class="code-annotations-line"
                v-for="(line, index) in content"
                :key="index + 'code'"
            >
                <div class="position-relative d-flex">
                    <div class="gutter">
                        <code
                            class="code-annotations-linenr"
                            v-bind:style="{ width: `${maxLineNumberDigits}ch` }"
                        >{{ index + 1 }}</code>
                        <div class="review-bar">
                            <span
                                v-for="review in reviewsInFile"
                                :key="index + 'review_' + review"
                                v-bind:style="{
                                    'background-color': filterAnnotationsAt(index, false, false, review).length > 0
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
                        v-html="line.replace(/^$/, '<br />')"
                    ></code><code
                        v-else
                        :linenr="index + 1"
                        v-bind:class="{
                            comment: true,
                            comment_start: hasAnnotationsStartingAt(index),
                            comment_end: hasAnnotationsEndingAt(index)
                        }"
                        v-html="line.replace(/^$/, '<br />')"
                        role="button"
                        @click="toggleAnnotationsAt(index)"
                    ></code>
                    <icon
                        v-if="hasAnnotationsStartingAt(index)"
                        class="arrow"
                        :class="{ rotate: getAnnotationsStartingAt(index).every(annotation => annotationState[annotation.id] === true) }"
                        role="button"
                        name="chevron-down"
                        @click.native="toggleAnnotationsAt(index)"
                    />
                </div>
                <div v-for="annotation in getAnnotationsEndingAt(index)" :key="annotation.id">
                    <b-collapse
                        v-bind:style="{
                            paddingLeft: `calc(${(reviewsInFile.length - reviewsInFile.indexOf(annotation.reviewId)) * 0.5 + 1.5}ch + 1px)`,
                            left: `calc(${maxLineNumberDigits + 0.5 * (1 + reviewsInFile.indexOf(annotation.reviewId))}ch + 1px)`,
                            borderLeft: `0.25ch solid ${reviewColors[annotation.reviewId]}`,
                            minWidth:
                                $refs.container ?
                                    `calc(${$refs.container.clientWidth}px - (${maxLineNumberDigits + 3}ch + 1px))` : null
                        }"
                        class="comment-container"
                        v-model="annotationState[annotation.id]">
                        <b-card>
                            <div v-if="editingAnnotation !== null && editingAnnotation.endLineNumber === index + 1">
                                <PeerTextarea
                                    placeholder="Type your comment"
                                    rows="3"
                                    max-rows="5"
                                    @submit="(text) => submitAnnotation(annotation, text)"
                                    @cancel="cancelEdit"
                                    :maxLength="maxCommentLength"
                                    :defaultLanguage="language"
                                    :defaultContent="unescapeHTML(annotation.commentText)"
                                />
                            </div><div v-else class="d-flex">
                                <span class="comment-text" v-html="highlightComment(annotation.commentText)"></span>
                                <div style="flex-shrink: 0">
                                    <icon
                                        v-if="!readOnly"
                                        name="pen"
                                        class="mx-1 text-primary"
                                        role="button" 
                                        @click.native="editAnnotation(annotation)"
                                        v-b-modal="`editModal_${annotation.id}`"
                                    />
                                    <b-modal 
                                        :id="`editModal_${annotation.id}`" 
                                        @ok="editModalOk(index)"
                                        variant="danger"
                                        title="Warning!"
                                        v-if="showEditModal"
                                        centered>
                                        {{ getModalText() }}
                                    </b-modal>
                                    <icon
                                        v-if="!readOnly"
                                        name="trash"
                                        class="text-danger"
                                        role="button"
                                        v-b-modal="`modal_${annotation.id}`"
                                    />
                                    <b-modal
                                        @ok="deleteAnnotation(annotation)"
                                        :id="`modal_${annotation.id}`"
                                        title="Confirmation"
                                        centered>
                                        Are you sure you want to delete this comment?
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
    props: ["content", "comments", "language", "maxCommentLength", "selectedFile", "readOnly", "reviewColors"],
    mixins: [notifications],
    components: { PeerTextarea },
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
        getAnnotationsStartingAt(lineIndex) {
            return this.filterAnnotationsAt(lineIndex, true, false, -1)
        },
        hasAnnotationsStartingAt(lineIndex) {
            return this.getAnnotationsStartingAt(lineIndex).length > 0
        },
        getAnnotationsEndingAt(lineIndex) {
            return this.filterAnnotationsAt(lineIndex, false, true, -1)
        },
        hasAnnotationsEndingAt(lineIndex) {
            return this.getAnnotationsEndingAt(lineIndex).length > 0
        },
        filterAnnotationsAt(lineIndex, startsAt = false, endsAt = false, reviewId = -1) {
            return this.getAnnotationsAt(lineIndex).filter(comment => {
                return (
                    (!startsAt || comment.startLineNumber - 1 === lineIndex) &&
                    (!endsAt || comment.endLineNumber - 1 === lineIndex) &&
                    (reviewId < 0 || comment.reviewId === reviewId)
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
        highlightComment(text) {
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
            this.editComment(lineIndex)
        },
        getModalText() {
            const annotation = this.editingAnnotation
            // If there is an edit in another file, redirect the user to that file.
            if (this.selectedFile !== annotation.selectedFile) {
                return `If you start editing this comment, your edit on file ${annotation.selectedFile} will be lost.`
            }

            // If the lines are the same, return only one line
            if (annotation.startLineNumber === annotation.endLineNumber) {
                return `If you start editing this comment, your edit on line ${annotation.endLineNumber} will be lost.`
            } else {
                return `If you start editing this comment, your edit between the lines ${annotation.startLineNumber} and ${annotation.endLineNumber} will be lost.`
            }
        },
        toggleAnnotationsAt(lineIndex) {
            const allExtended = this.getAnnotationsAt(lineIndex).every(
                annotation => this.annotationState[annotation.id] === true
            )
            this.getAnnotationsAt(lineIndex).forEach(annotation => {
                this.$set(this.annotationState, annotation.id, !allExtended)
            })
        }
    },
    computed: {
        // Compute map<line number, map<reviewId, *comment?>>
        lineAnnotationMap() {
            const result = {}
            for (let i = 0; i < this.content.length; i++) {
                const line = []
                for (let j = 0; j < this.comments.length; j++) {
                    if (
                        this.comments[j].startLineNumber - 1 <= i &&
                        this.comments[j].endLineNumber - 1 >= i &&
                        this.comments[j].selectedFile === this.selectedFile
                    ) {
                        line.push(this.comments[j])
                    }
                }

                if (line.length > 0) {
                    result[i.toString()] = line
                }
            }
            return result
        },
        reviewsInFile() {
            return Array.from(new Set(this.comments.map(comment => comment.reviewId)))
        },
        maxLineNumberDigits() {
            return Math.ceil(Math.log(this.content.length + 1) / Math.log(10))
        }
    }
}
</script>

<style lang="scss" scoped>
$code-annotation-background: rgba(0, 0, 0, 0.03);

code,
.comment-text::v-deep {
    background-color: inherit;
    font-family: var(--font-family-monospace);
    white-space: pre;
    display: inline-block;
    box-sizing: border-box;
    width: 100%;
}

.comment-text {
    display: inline-block;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-all;
    white-space: pre-wrap;
    margin-right: auto;
    font-family: var(--default-font);
    font-size: initial;

    &::v-deep code {
        background-color: $code-annotation-background;
        display: inline-block;
        font-size: 87.5%;

        span {
            font-family: inherit !important;
        }
    }
}

.comment-container {
    position: sticky;
    width: fit-content;
}

pre {
    white-space: pre-line;
    display: inline-block;
    width: 100%;
    background-color: white;
    margin: 0;
    max-height: 80vh;
    font-size: 87.5%;

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
            &::v-deep span {
                font-family: inherit !important;
            }

            &.comment {
                border-left: 1px solid var(--gray);
                border-right: 1px solid var(--gray);
                background-color: $code-annotation-background;
                margin-right: 1ch;
                padding-right: 7ch;
            }

            &.comment_start {
                border-top: 1px solid var(--gray);
                border-top-left-radius: 3px;
                border-top-right-radius: 3px;
            }

            &.comment_end {
                border-bottom: 1px solid var(--gray);
                border-bottom-left-radius: 3px;
                border-bottom-right-radius: 3px;
            }

            &.code-annotations-linenr {
                flex-shrink: 0;
                padding-right: 0.5ch;
                background-color: inherit;
                display: inline-block;
                text-align: right;
            }

            &.code-annotations-code {
                padding-right: 7ch;
            }
        }

        &.collapse {
            margin-right: 1ch;
            font-family: var(--font-family-monospace);
        }

        &.card {
            font-family: initial;
        }

        .fa-icon {
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
    border-right: 1px solid var(--gray);
    margin-right: 1ch;
    padding-right: 0.5ch;
    user-select: none;
    box-sizing: content-box;
    position: sticky;
    left: 0;

    .review-bar {
        padding: 0 0.5ch;
        display: flex;
        align-items: stretch;

        span {
            width: 0.25ch;

            &:not(:last-of-type) {
                margin-right: 0.25ch;
            }
        }
    }
}
</style>
