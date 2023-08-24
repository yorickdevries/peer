<template>
    <div>
        <component @next-card="nextCard" :is="cardNames[currCardIndex]"></component>
    </div>
</template>

<script>
import AssignmentDetailsCard from "@/components/teacher-dashboard/wizard/cards/AssignmentDetailsCard.vue"
import GroupUploadCard from "@/components/teacher-dashboard/wizard/cards/GroupUploadCard.vue"
export default {
    name: "wizard",
    components: { AssignmentDetailsCard, GroupUploadCard },
    data() {
        return {
            cardNames: ["AssignmentDetailsCard", "GroupUploadCard"],
            currCardIndex: 0,
        }
    },
    methods: {
        nextCard() {
            this.currCardIndex++
        },
    },
}
</script>
