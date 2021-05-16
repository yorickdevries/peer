<template>
    <span>
        <span v-for="(line, index) in content" :linenr="index + 1" :key="index">
            <span v-if="lineNumbers.includes(index + 1)">
                <b-card no-body>
                    <b-card-header class="p-0">
                        <div class="d-flex justify-content-between">
                            <pre><code style="display: block" :linenr="index + 1" v-html="line" ></code></pre>
                            <!-- TODO: Dynamically change icon -->
                            <div class="pr-2"><icon name="plus" v-b-toggle="`comment_${index}`" /></div>
                        </div>
                    </b-card-header>
                    <b-collapse :id="`comment_${index}`" :ref="`comment_${index}`" accordion="comments">
                        <b-card-body>{{ getCommentTextFromStartingLineNumber(index + 1) }}</b-card-body>
                    </b-collapse>
                </b-card>
            </span>
            <!-- If the line doesn't have a comment -->
            <span v-else>
                <pre><code style="display: block" :linenr="index + 1" v-html="line"></code></pre>
            </span>
        </span>
    </span>
</template>

<script>
export default {
    props: ["content", "comments"],
    methods: {
        getCommentTextFromStartingLineNumber(lineNr) {
            for (const comment of this.comments) {
                if (comment.startLineNumber == lineNr) {
                    return comment.commentText
                }
            }
            return null
        }
    },
    computed: {
        lineNumbers: function() {
            let retValue = []
            for (const comment of this.comments) {
                retValue[retValue.length] = comment.startLineNumber
            }
            return retValue
        }
    }
}
</script>
