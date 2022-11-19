<template>
    <div>
        <b-table striped outlined show-empty stacked="md" :items="items"></b-table>
    </div>
</template>

<script>
export default {
    name: "ParticipationTable",
    data() {
        return {
            items: [
                { status: "Initial", submissions: 20, reviews: 15, feedback: 10 },
                { status: "Finished", submissions: 15, reviews: 10, feedback: 5 }
            ]
        }
    }
}
</script>
