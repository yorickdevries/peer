<template>
    <span>
        <span v-for="(line, index) in content" :linenr="index + 1" :key="index">
            <span v-if="lineNumbers.includes(index + 1)">
                <b-card no-body>
                    <b-card-header header-tag="header" role="tab">
                        <b-container>
                            <b-row>
                                <b-col>
                                    <pre><code style="display: block" :linenr="index + 1" v-html="line" ></code></pre>
                                </b-col>
                                <!-- TODO: Dynamically change icon -->
                                <b-col><icon name="plus" v-b-toggle="`comment_${index}`"/></b-col>
                            </b-row>
                        </b-container>
                    </b-card-header>
                    <b-collapse :id="`comment_${index}`" :ref="`comment_${index}`" accordion="comments" role="tabpanel">
                        <b-card-body>
                            <b-card-text>{{ getCommentTextFromStartingLineNumber(index + 1) }}</b-card-text>
                        </b-card-body>
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
