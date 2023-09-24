<template>
    <CardTemplate @next-card="nextCard" @prev-card="prevCard" @switch-mode="switchMode">
        <h1 class="text-center" style="font-size: 5rem">Add assignment file and link (optional)</h1>
        <b-form-file
            class="form"
            accept=".pdf,.zip,.doc,.docx"
            :placeholder="assignment.file ? `${assignment.file.name}` : 'Add a file for the assignment'"
            v-model="assignment.file"
        >
        </b-form-file>
        <b-form-input
            class="link"
            type="text"
            placeholder="Add a link where the assignment can be found for the student"
            v-model="assignment.externalLink"
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
