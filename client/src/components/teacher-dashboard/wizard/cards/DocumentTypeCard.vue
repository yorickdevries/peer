<template>
    <CardTemplate @next-card="nextCard" @prev-card="prevCard" @switch-mode="switchMode">
        <h1 class="text-center custom-margin" style="font-size: 4rem">
            Choose the type of assignment to be submitted.
        </h1>
        <div class="buttons">
            <b-button @click="setDocument" class="custom-button">Document</b-button>
            <b-button @click="setCode" class="custom-button">Code</b-button>
            <b-button @click="setText" class="custom-button">Text</b-button>
        </div>
    </CardTemplate>
</template>

<script>
import cards from "../../../../mixins/cards"
import CardTemplate from "@/components/teacher-dashboard/wizard/CardTemplate.vue"

export default {
    name: "DocumentTypeCard",
    components: { CardTemplate },
    mixins: [cards],
    props: ["assignment"],

    methods: {
        setDocument() {
            // this.$emit("document-type", "document")\
            this.assignment.assignmentType = "document"
            this.assignment.submissionExtensions = ".pdf,.zip,.doc,.docx"
        },
        setCode() {
            // this.$emit("document-type", "code")
            this.assignment.assignmentType = "code"
            this.assignment.submissionExtensions = ".*"
        },
        setText() {
            // this.$emit("document-type", "text")
            this.assignment.assignmentType = "text"
            // TODO: Add text file extensions to assignment object
        },
    },
}
</script>

<style scoped>
.buttons {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    margin-bottom: 5rem;
}
.custom-margin {
    margin-bottom: 15rem;
}
.custom-button {
    font-size: 1.5rem;
    padding: 20px 30px;
    width: 20rem;
}
</style>
