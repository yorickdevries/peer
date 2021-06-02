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
                            :linenr="index + 1"
                            v-bind:style="{ width: `${maxLineNumberDigits}ch` }"
                        >{{ index + 1 }}</code>
                        <div class="review-bar">
                            <span
                                v-for="review in reviewsInFile"
                                :key="index + 'review_' + review"
                                v-bind:style="{
                                    'background-color': lineNumbers[index + 1].some(id => comments[id].reviewId === review)
                                        ? reviewColors[review]
                                        : 'transparent'
                                }"
                            ></span>
                        </div>
                    </div>
                    <code
                        class="code-annotations-code"
                        v-if="!isCommentedOn(index + 1)"
                        :linenr="index + 1"
                        v-html="line.replace(/^$/, '<br />')"
                    ></code><code
                        v-else
                        :linenr="index + 1"
                        v-bind:class="{ comment: true, comment_start: isStartingLine(index + 1), comment_end: isEndingLine(index + 1) }"
                        v-html="line.replace(/^$/, '<br />')"
                        role="button"
                        @click="toggleComment(lineNumbers[index + 1])"
                    ></code>
                    <icon
                        v-if="isStartingLine(index + 1)"
                        class="arrow"
                        :class="{ rotate: comment[lineNumbers[index + 1].find(id => comments[id].startLineNumber === index + 1)] }"
                        role="button"
                        name="chevron-down"
                        @click.native="toggleComment(lineNumbers[index + 1])"
                    />
                </div>
                <div v-for="(review, reviewIndex) in reviewsInFile" :key="review">
                    <b-collapse
                        v-if="getCommentsEndingAt(index + 1).some(id => comments[id].reviewId === review)"
                        v-bind:style="{
                            paddingLeft: `calc(${(reviewsInFile.length - reviewIndex) * 0.5 + 1.5}ch + 1px)`,
                            left: `calc(${maxLineNumberDigits + 0.5 * (1 + reviewIndex)}ch + 1px)`,
                            borderLeft: `0.25ch solid ${reviewColors[review]}`,
                            minWidth:
                                $refs.container ?
                                    `calc(${$refs.container.clientWidth}px - (${maxLineNumberDigits + 3}ch + 1px))` : null
                        }"
                        class="comment-container"
                        v-model="comment[`${lineNumbers[index + 1][lineNumbers[index + 1].length - 1]}`]">
                        <b-card>
                            <div v-if="editing && editingEndingLine === index + 1">
                                <PeerTextarea
                                    placeholder="Type your comment"
                                    rows="3"
                                    max-rows="5"
                                    @submit="(text) => submitEditedComment(index + 1, text)"
                                    @cancel="cancelEdit"
                                    :maxLength="maxCommentLength"
                                    :defaultLanguage="language"
                                    :defaultContent="unescapeHTML(comments[lineNumbers[index + 1][lineNumbers[index + 1].length - 1]].commentText)"
                                />
                            </div><div v-else class="d-flex">
                                <span class="comment-text" v-html="highlightComment(index + 1)"></span>
                                <div style="flex-shrink: 0">
                                    <icon
                                        v-if="!readOnly"
                                        name="pen"
                                        class="mx-1 text-primary"
                                        role="button" 
                                        @click.native="editComment(index + 1)"
                                        v-b-modal="`editModal_${lineNumbers[index + 1][lineNumbers[index + 1].length - 1]}`"
                                    />
                                    <b-modal 
                                        :id="`editModal_${lineNumbers[index + 1][lineNumbers[index + 1].length - 1]}`" 
                                        @ok="editModalOk(index + 1)"
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
                                        v-b-modal="`modal_${lineNumbers[index + 1][lineNumbers[index + 1].length - 1]}`"
                                    />
                                    <b-modal
                                        @ok="deleteComment(lineNumbers[index + 1][lineNumbers[index + 1].length - 1])"
                                        :id="`modal_${lineNumbers[index + 1][lineNumbers[index + 1].length - 1]}`"
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
            editing: false,
            editingEndingLine: null,
            editingFilePath: null,
            showEditModal: false,
            comment: {}
        }
    },
    created() {
        window.addEventListener("resize", () => this.$forceUpdate())
    },
    methods: {
        isStartingLine(lineNr) {
            return (
                this.isCommentedOn(lineNr) &&
                this.lineNumbers[lineNr].some(id => this.comments[id].startLineNumber === lineNr)
            )
        },
        isEndingLine(lineNr) {
            return (
                this.isCommentedOn(lineNr) &&
                this.lineNumbers[lineNr].some(id => this.comments[id].endLineNumber === lineNr)
            )
        },
        getCommentsEndingAt(lineNr) {
            return this.lineNumbers[lineNr].filter(id => this.comments[id].endLineNumber === lineNr)
        },
        isCommentedOn(lineNr) {
            return lineNr >= 1 && lineNr <= this.lineNumbers.length && this.lineNumbers[lineNr].length > 0
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
        highlightComment(lineNr) {
            const codeBlock = /(```)([^\s]*)(\s?)((?:.|\s)*?)\1/g
            const commentIndex = this.lineNumbers[lineNr][this.lineNumbers[lineNr].length - 1]

            return this.escapeHTML(this.comments[commentIndex].commentText).replaceAll(
                codeBlock,
                (match, delimiter, language, separator, code) => {
                    if (hljs.getLanguage(language)) {
                        code = hljs.highlight(this.unescapeHTML(code), { language, ignoreIllegals: true }).value
                    } else {
                        code = language + separator + code
                    }
                    return `<code><span style="white-space: pre">${code}</span></code>`
                }
            )
        },
        deleteComment(index) {
            this.$emit("deleted", index)
        },
        editComment(lineNr) {
            if (this.editing) {
                this.showEditModal = true
                return
            }
            this.editing = true
            this.editingEndingLine = lineNr
            this.editingFilePath = this.selectedFile
        },
        submitEditedComment(index, commentText) {
            this.$emit("edited", this.lineNumbers[index], commentText)
            this.cancelEdit()
        },
        cancelEdit() {
            this.editing = false
            this.editingEndingLine = null
            this.editingFilePath = null
        },
        editModalOk(lineNr) {
            this.editing = false
            this.editComment(lineNr)
        },
        getModalText() {
            // If there is an edit in another file, redirect the user to that file.
            if (this.selectedFile !== this.editingFilePath) {
                return "If you start editing this comment, your edit on file " + this.editingFilePath + " will be lost."
            }

            // Starting line number of the comment
            const startingLineNr = this.comments[this.lineNumbers[this.editingEndingLine]].startLineNumber

            // If the lines are the same, return only one line
            if (startingLineNr === this.editingEndingLine) {
                return `If you start editing this comment, your edit on line ${this.editingEndingLine} will be lost.`
            } else {
                return (
                    `If you start editing this comment, your edit between the lines ` +
                    `${startingLineNr} and ${this.editingEndingLine} will be lost.`
                )
            }
        },
        toggleComment(line) {
            const allExtended = line.every(id => !!this.comment[id])
            line.forEach(id => {
                this.$set(this.comment, id, !allExtended)
            })
        }
    },
    computed: {
        lineNumbers() {
            const res = new Array(this.content.length + 1).fill(-1).map((_, lineNr) => {
                const result = []
                for (let i = 0; i < this.comments.length; i++) {
                    if (
                        this.comments[i].startLineNumber <= lineNr &&
                        this.comments[i].endLineNumber >= lineNr &&
                        this.comments[i].selectedFile === this.selectedFile
                    ) {
                        result.push(i)
                    }
                }
                return result
            })
            return res
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
