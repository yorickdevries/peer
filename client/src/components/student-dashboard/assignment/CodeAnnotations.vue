<template>
    <span>
        <span v-for="(line, index) in content" :key="index">
            <!-- TODO: Only load comment collapsibles for actual comments, 
                so replace the 'index === 0 ' by a less nonsensical condition and load an actual comment -->
            <!-- If line does have a comment and is not empty -->
            <span v-if="index === 0 && line !== ''">
                <b-card no-body>
                    <b-card-header header-tag="header" role="tab">
                        <b-container>
                            <b-row>
                                <b-col>
                                    <pre><code style="display: block" v-html="line" ></code></pre>
                                </b-col>
                                <!-- TODO: Dynamically change icon -->
                                <b-col><icon name="plus" v-b-toggle="`comment_${index}`"/></b-col>
                            </b-row>
                        </b-container>
                    </b-card-header>
                    <b-collapse :id="`comment_${index}`" :ref="`comment_${index}`" accordion="comments" role="tabpanel">
                        <b-card-body>
                            <b-card-text>{{ comments[index] }}</b-card-text>
                        </b-card-body>
                    </b-collapse>
                </b-card>
            </span>
            <!-- If the line doesn't have a comment -->
            <span v-else>
                <pre><code style="display: block" v-html="line"></code></pre>
            </span>
        </span>
    </span>
</template>

<script>
export default {
    props: ["content", "comments"]
}
</script>
