<template>
    <div>
        <pre>
            <div v-for="(line, index) in content" :key="index + 'line'">
                <code v-bind:style="{ width: `${maxLineNumberDigits}ch` }">{{ index + 1 }}</code>
            </div>
        </pre>
        <pre>
            <div v-for="(line, index) in content" :key="index + 'code'">
                <code v-html="line.replace(/^$/, '<br />')"></code>
            </div>
        </pre>
    </div>
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
            white-space: pre;
        }
    }

    &:first-of-type {
        div {
            code {
                display: inline-block;
                text-align: right;
                box-sizing: content-box;
                padding-right: 1ch;
                margin-right: 1ch;
                border-right: 1px solid var(--gray);
            }
        }
    }
}
</style>
