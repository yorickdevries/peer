<template>
    <pre><div class="code-annotations-wrapper">
            <div
                class="position-relative code-annotations-line"
                v-for="(line, index) in content"
                :key="index + 'code'"
            >
                <div class="d-flex">
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
                        v-b-toggle="`comment_${lineNumbers[index + 1]}`"
                    ></code>
                </div>
                <!-- TODO: Dynamically change icon -->
                <icon
                    v-if="isStartingLine(index + 1)"
                    class="position-absolute mt-1 mr-2"
                    style="top: 0; right: 0; z-index: 1"
                    role="button"
                    name="plus"
                    v-b-toggle="`comment_${lineNumbers[index + 1]}`"
                />
                <b-collapse
                    v-if="isEndingLine(index + 1)"
                    :id="`comment_${lineNumbers[index + 1]}`"
                    :ref="`comment_${lineNumbers[index + 1]}`"
                    v-bind:style="{ marginLeft: `calc(${maxLineNumberDigits + 2}ch + 1px)` }">
                    <b-card>
                        <div class="d-flex justify-content-between">
                            <span>{{ comments[lineNumbers[index + 1]].commentText }}</span>
                            <icon
                                name="trash"
                                class="ml-auto text-danger"
                                style="flex-shrink: 0"
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
    props: ["content", "comments", "selectedFile"],
    methods: {
        isStartingLine(lineNr) {
            return this.isCommentedOn(lineNr) && (lineNr === 0 || this.lineNumbers[lineNr - 1] === -1)
        },
        isEndingLine(lineNr) {
            return (
                this.isCommentedOn(lineNr) &&
                (lineNr === this.lineNumbers.length - 1 || this.lineNumbers[lineNr + 1] === -1)
            )
        },
        isCommentedOn(lineNr) {
            return lineNr >= 1 && lineNr <= this.lineNumbers.length && this.lineNumbers[lineNr] >= 0
        },
        deleteComment(index) {
            this.$emit("deleted", index)
        }
    },
    computed: {
        lineNumbers: function() {
            const res = new Array(this.content.length)
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
                background-color: #f8f8f8;
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
    }
}

.collapse {
    font-family: var(--font-family-monospace);
}

.card {
    font-family: initial;
}
</style>
