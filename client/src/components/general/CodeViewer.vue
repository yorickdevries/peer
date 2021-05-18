<template>
    <b-card>
        <pre><div class="code-viewer-wrapper">
            <div
                class="position-relative code-viewer-line"
                v-for="(line, index) in content"
                :key="index + 'code'"
            >
                <div class="d-flex">
                    <code
                        class="code-viewer-linenr"
                        :linenr="index + 1"
                        v-bind:style="{ width: `${maxLineNumberDigits}ch` }"
                    >{{ index + 1 }}</code>
                    <code
                        class="code-viewer-code"
                        :linenr="index + 1"
                        v-html="line.replace(/^$/, '<br />')"
                    ></code>
                </div>
            </div>
        </div></pre>
    </b-card>
</template>

<script>
export default {
    props: ["content"],
    computed: {
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

    .code-viewer-wrapper {
        display: flex;
        flex-direction: column;
        min-width: min-content;
        width: 100%;

        .code-viewer-line {
            flex-grow: 1;
        }
    }

    .code-viewer-wrapper,
    .code-viewer-line,
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

            &.code-viewer-linenr {
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

            &.code-viewer-code {
                padding-right: 7ch;
            }

            &::v-deep span {
                font-family: inherit;
            }
        }
    }
}
</style>
