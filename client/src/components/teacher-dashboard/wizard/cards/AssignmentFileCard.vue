<template>
    <CardTemplate @next-card="nextCard" @prev-card="prevCard" @switch-mode="switchMode">
        <h1 class="text-center" style="font-size: 5rem">Add assignment file and link (optional)</h1>
        <b-form-file class="form" placeholder="Add a file for the assignment" @input="setFile"> </b-form-file>
        <b-form-input
            class="link"
            type="text"
            placeholder="Add a link where the assignment can be found for the student"
            @input="setLink"
        ></b-form-input>
    </CardTemplate>
</template>

<script>
import Cards from "@/mixins/cards"
import CardTemplate from "@/components/teacher-dashboard/wizard/CardTemplate.vue"

export default {
    name: "AssignmentFileCard",
    components: { CardTemplate },
    mixins: [Cards],
    props: ["assignment"],

    methods: {
        setFile(file) {
            this.assignment.file = file
        },
        setLink(link) {
            this.assignment.externalLink = link
        },
    },
}
</script>

<style scoped>
.form {
    margin-top: 8rem;
    height: 5rem;
    font-size: 2rem;
}
</style>
