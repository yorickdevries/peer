<template>
    <pre>
        <code style="display: block" v-for="(line, index) in content" :key="index" v-html="line"></code>
    </pre>
</template>

<script>
export default {
    props: ["content"]
}
</script>
