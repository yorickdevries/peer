<template>
    <pre ref="container"><div class="code-annotations-wrapper">
            <div
                class="code-annotations-line"
                v-for="(line, index) in content"
                :key="index + 'code'"
            >
                <div class="position-relative d-flex" style="align-items: stretch">
                    <div class="gutter" :style="{ 'margin-right': gutterMarginRight }">
                        <code
                            class="code-annotations-linenr"
                            :style="{
                                width: `${maxLineNumberDigits}ch`
                            }"
                        >{{ index + 1 }}</code>
                        <div
                            class="review-bar"
                            :style="{
                                'margin-left': reviewBarMarginSides,
                                'margin-right': reviewBarMarginSides,
                                'padding-left': reviewBarPaddingLeft
                            }"
                        >
                            <span
                                v-for="review in reviewsInFile"
                                :key="index + 'review_' + review"
                                :style="{
                                    width: '0px',
                                    'margin-right': reviewBarSpanMarginRight,
                                    'border-left-width': reviewBarSpanWidth,
                                    'border-left-style': 'solid',
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
                    <icon
                        v-if="hasAnnotationsStartingAt(index)"
                        class="arrow"
                        :class="{ rotate: getAnnotationsStartingAt(index).every(annotation => annotationState[annotation.id] === true) }"
                        role="button"
                        name="chevron-down"
                        @click.native="toggleAnnotationsAt(index)"
                    />
                </div>
                <div 
                    v-for="annotation of getAnnotationsEndingAt(index)"
                    :key="annotation"
                    class="position-relative d-flex"
                    style="align-items: stretch"
                >
                    <div class="gutter" :style="{ 'margin-right': gutterMarginRight }">
                        <code
                            class="code-annotations-linenr"
                            :style="{
                                width: `${maxLineNumberDigits}ch`
                            }"
                        ></code>
                        <div
                            class="review-bar"
                            :style="{
                                'margin-left': reviewBarMarginSides,
                                'margin-right': reviewBarMarginSides,
                                'padding-left': reviewBarPaddingLeft
                            }"
                        >
                            <span
                                v-for="review in reviewsInFile"
                                :key="index + 'review_' + review"
                                :style="{
                                    width: '0px',
                                    'margin-right': reviewBarSpanMarginRight,
                                    'border-left-width': reviewBarSpanWidth,
                                    'border-left-style': 'solid',
                                    'border-left-color': filterAnnotationsAt(index, false, true, review).length > 0
                                        ? reviewColors[review]
                                        : 'transparent'
                                }"
                            ></span>
                        </div>
                    </div>
                    <b-collapse
                        v-model="annotationState[annotation.id]"
                    >
                        <b-card style="display: inline-block">
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
                                    <icon
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

export default {
    props: ["content", "annotations", "language", "maxAnnotationLength", "selectedFile", "readOnly", "reviewColors"],
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
                        this.annotations[j].selectedFile === this.selectedFile
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
                        .filter(annotation => annotation.selectedFile === this.selectedFile)
                        .map(annotation => annotation.reviewId)
                )
            )
        },
        maxLineNumberDigits() {
            return Math.ceil(Math.log(this.content.length + 1) / Math.log(10))
        },
        reviewBarSpanWidth() {
            return "3px"
        },
        reviewBarSpanMarginRight() {
            return "4px"
        },
        reviewBarPaddingLeft() {
            return "4px"
        },
        reviewBarMarginSides() {
            return "4px"
        },
        gutterMarginRight() {
            return "8px"
        }
    }
}
</script>

<style lang="scss" scoped>
$code-annotation-background: rgba(0, 0, 0, 0.03);

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
            &::v-deep {
                span {
                    font-family: inherit !important;
                }
            }

            &.annotation {
                border-left: 1px solid var(--gray);
                border-right: 1px solid var(--gray);
                background-color: $code-annotation-background;
                margin-right: 1ch;
                padding-right: 7ch;
            }

            &.annotation_start {
                border-top: 1px solid var(--gray);
                border-top-left-radius: 3px;
                border-top-right-radius: 3px;
            }

            &.annotation_end {
                border-bottom: 1px solid var(--gray);
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

            &.code-annotations-code {
                padding-right: 7ch;
            }
        }

        &.collapse {
            font-family: var(--font-family-monospace);
            width: 100%;
            margin-right: 1ch;
        }

        &.card {
            width: 100%;
            font-family: initial;
            overflow: hidden;
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
    box-shadow: inset -5px 0 0 -4px var(--gray);
    user-select: none;
    box-sizing: content-box;
    position: sticky;
    left: 0;
    font-family: var(--font-family-monospace);

    .review-bar {
        font-family: inherit !important;
        display: flex;
        align-items: stretch;

        span {
            box-sizing: content-box;
            font-family: inherit !important;
        }
    }
}

.annotation-container {
    margin-right: 1ch;
    font-family: var(--font-family-monospace);

    &::v-deep {
        .collapse {
            position: sticky;
            margin-right: 0px;
        }
    }
}
</style>
