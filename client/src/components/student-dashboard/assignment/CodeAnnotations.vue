<template>
    <pre>
        <div v-for="(line, index) in content" :key="index + 'code'">
            <div class="d-flex position-relative">
                <code
                    style="user-select: none"
                    :linenr="index + 1"
                    v-bind:style="{ width: `${maxLineNumberDigits}ch` }"
                >{{ index + 1 }}</code>
                <code
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
                <!-- TODO: Dynamically change icon -->
                <icon
                    v-if="isStartingLine(index + 1)"
                    class="position-absolute mt-1 mr-2"
                    style="right: 0; z-index: 1"
                    role="button"
                    name="plus"
                    v-b-toggle="`comment_${lineNumbers[index + 1]}`"
                />
            </div>
            <b-collapse
                v-if="lineNumbers[index + 1] >= 0 && lineNumbers[index + 2] === -1"
                :id="`comment_${lineNumbers[index + 1]}`"
                :ref="`comment_${lineNumbers[index + 1]}`"
                v-bind:style="{ marginLeft: `calc(${maxLineNumberDigits + 2}ch + 1px)` }"
            >
                <b-card>{{ comments[lineNumbers[index + 1]].commentText }}</b-card>
            </b-collapse>
        </div>
    </pre>
</template>

<script>
export default {
    props: ["content", "comments"],
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
        }
    },
    computed: {
        lineNumbers: function() {
            const res = new Array(this.content.length)
                .fill(-1)
                .map((value, lineNr) =>
                    this.comments.findIndex(
                        comment => comment.startLineNumber <= lineNr && comment.endLineNumber >= lineNr
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

    div {
        white-space: initial;

        code {
            font-family: monospace, monospace;
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

            &:first-of-type {
                flex-shrink: 0;
                margin-right: 1ch;
                border-right: 1px solid var(--gray);
                box-sizing: content-box;
                padding-right: 1ch;
                user-select: none;

                display: inline-block;
                text-align: right;
            }

            &::v-deep span {
                font-family: inherit;
            }
        }
    }
}

.collapse {
    font-family: monospace, monospace;
}

.card {
    font-family: initial;
}
</style>
