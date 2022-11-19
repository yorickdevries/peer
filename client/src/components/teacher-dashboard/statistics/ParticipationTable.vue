<template>
    <div>
        <b-table striped outlined show-empty stacked="md" :fields="fields" :items="data">
            <template #cell(status)="data">
                <b>{{ data.item.status }}</b>
            </template>
        </b-table>

        <b-table v-if="explanation" striped outlined show-empty stacked="md" :fields="fields" :items="explanationData">
            <template #cell(status)="data">
                <b>{{ data.item.status }}</b>
            </template>
        </b-table>
        <b-button @click="explanation = !explanation" variant="warning">{{ this.message }} explanation</b-button>
    </div>
</template>

<script>
export default {
    name: "ParticipationTable",
    props: ["data"],
    // num groups, num reviews distributed, num reviews submitted
    // num groups with final submission, num reviews submitted, num feedback reviews submitted
    data() {
        return {
            fields: ["status", "submissions", "reviews", "feedback"],
            explanation: false,
            explanationData: [
                {
                    status: "Initial",
                    submissions: "Number of groups/students",
                    reviews: "Number of reviews distributed",
                    feedback: "Number of evaluations distributed"
                },
                {
                    status: "Final",
                    submissions: "Number of final submissions",
                    reviews: "Number of reviews submitted",
                    feedback: "Number of evaluations submitted"
                }
            ]
        }
    },
    computed: {
        message() {
            return this.explanation ? "Hide" : "Show"
        }
    }
}
</script>
