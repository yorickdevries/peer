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
    data() {
        return {
            fields: ["status", "submissions", "reviews", "evaluations"],
            explanation: false,
            explanationData: [
                {
                    status: "Initial",
                    submissions: "Number of groups/students",
                    reviews: "Number of reviews distributed",
                    evaluations: "Number of evaluations distributed"
                },
                {
                    status: "Final",
                    submissions: "Number of final submissions",
                    reviews: "Number of reviews submitted",
                    evaluations: "Number of evaluations submitted"
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
