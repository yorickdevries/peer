<template>
    <b-card>
        <div class="d-flex">
            <pre>
                <div v-for="(line, index) in content" :key="index + 'line'">
                    <code :linenr="index + 1" v-bind:style="{ width: `${maxLineNumberDigits}ch` }">{{ index + 1 }}</code>
                </div></pre>
            <pre>
                <div v-for="(line, index) in content" :key="index + 'code'">
                    <code :linenr="index + 1" v-html="line.replace(/^$/, '<br />')"></code>
                </div></pre>
        </div>
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

    div {
        white-space: initial;

        code {
            font-family: monospace, monospace;
            white-space: pre;

            &::v-deep span {
                font-family: inherit;
            }
        }
    }

    &:first-of-type {
        flex-shrink: 0;
        margin-right: 1ch;
        border-right: 1px solid var(--gray);
        box-sizing: content-box;
        padding-right: 1ch;
        user-select: none;

        div {
            code {
                display: inline-block;
                text-align: right;
            }
        }
    }
}
</style>
