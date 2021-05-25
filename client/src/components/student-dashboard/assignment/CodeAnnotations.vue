<template>
    <pre><div class="code-annotations-wrapper">
            <div
                class="code-annotations-line"
                v-for="(line, index) in content"
                :key="index + 'code'"
            >
                <div class="position-relative d-flex">
                    <code
                        class="code-annotations-linenr"
                        :linenr="index + 1"
                        v-bind:style="{ width: `${maxLineNumberDigits}ch` }"
                    >{{ index + 1 }}</code>
                    <code
                        class="code-annotations-code"
                        v-if="!isCommentedOn(index + 1)"
                        :linenr="index + 1"
                        v-html="line.replace(/^$/, '<br />')"
                    ></code><code
                        v-else
                        :linenr="index + 1"
                        v-bind:class="{ comment_start: isStartingLine(index + 1), comment: true, comment_end: isEndingLine(index + 1) }"
                        v-html="line.replace(/^$/, '<br />')"
                        role="button"
                        @click="toggleComment(lineNumbers[index + 1])"
                    ></code>
                    <icon
                        v-if="isStartingLine(index + 1)"
                        class="position-absolute my-auto arrow"
                        :class="{ rotate: comment[lineNumbers[index + 1]]}"
                        role="button"
                        name="chevron-up"
                        @click.native="toggleComment(lineNumbers[index + 1])"
                    />
                </div>
                <b-collapse
                    v-if="isEndingLine(index + 1)"
                    v-bind:style="{ marginLeft: `calc(${maxLineNumberDigits + 2}ch + 1px)` }"
                    v-model="comment[`${lineNumbers[index + 1]}`]">
                    <b-card>
                        <div v-if="editing && editingEndingLine === index + 1">
                            <b-form @submit="submitEditedComment(index + 1)" @reset="cancelEdit">
                                <b-form-textarea v-model="commentText" rows="3" max-rows="5" class="overflow-auto"></b-form-textarea>
                                <div class="float-right">
                                    <b-button type="reset" variant="secondary">Cancel</b-button>
                                    <b-button type="submit" variant="primary">Submit</b-button>
                                </div>
                            </b-form>
                        </div><div v-else class="d-flex">
                            <span class="comment-text mr-auto">{{ comments[lineNumbers[index + 1]].commentText }}</span>
                            <icon
                                v-if="!readOnly"
                                name="edit"
                                class="my-auto mx-2 text-primary"
                                role="button" 
                                @click.native="editComment(index + 1)"
                                v-b-modal="`editModal_${lineNumbers[index + 1]}`"
                            />
                            <b-modal 
                                :id="`editModal_${lineNumbers[index + 1]}`" 
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
                                class="my-auto text-danger"
                                role="button"
                                v-b-modal="`modal_${lineNumbers[index + 1]}`"
                            />
                            <b-modal
                                @ok="deleteComment(lineNumbers[index + 1])"
                                :id="`modal_${lineNumbers[index + 1]}`"
                                title="Confirmation"
                                centered>
                                Are you sure you want to delete this comment?
                            </b-modal>
                        </div>
                    </b-card>
                </b-collapse>
            </div>
    </div></pre>
</template>

<script>
export default {
    props: ["content", "comments", "selectedFile", "readOnly"],
    data() {
        return {
            editing: false,
            editingEndingLine: null,
            commentText: null,
            editingFilePath: null,
            showEditModal: false,
            comment: {}
        }
    },
    methods: {
        isStartingLine(lineNr) {
            return (
                this.isCommentedOn(lineNr) &&
                (lineNr === 1 || this.lineNumbers[lineNr - 1] !== this.lineNumbers[lineNr])
            )
        },
        isEndingLine(lineNr) {
            return (
                this.isCommentedOn(lineNr) &&
                (lineNr === this.lineNumbers.length || this.lineNumbers[lineNr + 1] !== this.lineNumbers[lineNr])
            )
        },
        isCommentedOn(lineNr) {
            return lineNr >= 1 && lineNr <= this.lineNumbers.length && this.lineNumbers[lineNr] >= 0
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
            this.commentText = this.comments[this.lineNumbers[lineNr]].commentText
            this.editingFilePath = this.selectedFile
        },
        submitEditedComment(index) {
            this.$emit("edited", this.lineNumbers[index], this.commentText)
            // Reset all variables after updating the comment
            this.cancelEdit()
        },
        cancelEdit() {
            this.editing = false
            this.editingEndingLine = null
            this.commentText = null
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
        toggleComment(index) {
            this.comment[index] = !this.comment[index]
        }
    },
    computed: {
        lineNumbers: function() {
            const res = new Array(this.content.length + 1)
                .fill(-1)
                .map((_, lineNr) =>
                    this.comments.findIndex(
                        comment =>
                            comment.startLineNumber <= lineNr &&
                            comment.endLineNumber >= lineNr &&
                            comment.selectedFile === this.selectedFile
                    )
                )
            return res
        },
        maxLineNumberDigits() {
            return Math.ceil(Math.log(this.content.length + 1) / Math.log(10))
        }
    }
}
</script>

<style lang="scss" scoped>
pre {
    white-space: pre-line;
    display: inline-block;
    width: 100%;
    background-color: white;
    margin: 0;
    max-height: 80vh;

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
            background-color: inherit;
            font-family: var(--font-family-monospace);
            white-space: pre;
            display: inline-block;
            box-sizing: border-box;
            width: 100%;

            &.comment {
                border-left: 1px solid var(--gray);
                border-right: 1px solid var(--gray);
                background-color: rgba(0, 0, 0, 0.03);
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
                margin-right: 1ch;
                border-right: 1px solid var(--gray);
                box-sizing: content-box;
                padding-right: 1ch;
                user-select: none;
                position: sticky;
                left: 0;
                background-color: inherit;
                display: inline-block;
                text-align: right;
            }

            &.code-annotations-code {
                padding-right: 7ch;
            }

            &::v-deep span {
                font-family: inherit;
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
            flex-shrink: 0;
        }
    }
}

.comment-text {
    font-size: initial;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-all;
}

.arrow {
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 1;
    margin-right: 2ch;
    transition: transform 0.2s ease-in-out;
}

.rotate {
    transform: rotate(180deg);
}
</style>
