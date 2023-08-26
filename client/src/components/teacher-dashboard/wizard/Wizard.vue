<template>
    <div>
        <component @next-card="nextCard" @prev-card="prevCard" :is="cardNames[currCardIndex]"></component>
    </div>
</template>

<script>
import AssignmentDetailsCard from "@/components/teacher-dashboard/wizard/cards/AssignmentDetailsCard.vue"
import GroupUploadCard from "@/components/teacher-dashboard/wizard/cards/GroupUploadCard.vue"
import DocumentTypeCard from "@/components/teacher-dashboard/wizard/cards/DocumentTypeCard.vue"
import PublishAssignmentCard from "@/components/teacher-dashboard/wizard/cards/PublishAssignmentCard.vue"
export default {
    name: "wizard",
    components: { AssignmentDetailsCard, GroupUploadCard, DocumentTypeCard, PublishAssignmentCard },
    data() {
        return {
            cardNames: ["AssignmentDetailsCard", "GroupUploadCard", "DocumentTypeCard", "PublishAssignmentCard"],
            currCardIndex: 0,
        }
    },
    methods: {
        nextCard() {
            this.currCardIndex++
        },
        prevCard() {
            this.currCardIndex--
        },
    },
}
</script>
