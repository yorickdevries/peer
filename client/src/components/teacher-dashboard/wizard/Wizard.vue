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
import HandInAssignmentCard from "@/components/teacher-dashboard/wizard/cards/HandInAssignmentCard.vue"
import AssignmentFileCard from "@/components/teacher-dashboard/wizard/cards/AssignmentFileCard.vue"
import DueDateReviewEvaluationCard from "@/components/teacher-dashboard/wizard/cards/DueDateReviewEvaluationCard.vue"
import DueDateReviewCard from "@/components/teacher-dashboard/wizard/cards/DueDateReviewCard.vue"
import StartDateReviewCard from "@/components/teacher-dashboard/wizard/cards/StartDateReviewCard.vue"
import AssignmentLinkCard from "@/components/teacher-dashboard/wizard/cards/AssignmentLinkCard.vue"
export default {
    name: "wizard",
    components: {
        AssignmentDetailsCard,
        GroupUploadCard,
        DocumentTypeCard,
        PublishAssignmentCard,
        HandInAssignmentCard,
        StartDateReviewCard,
        DueDateReviewCard,
        DueDateReviewEvaluationCard,
        AssignmentFileCard,
        AssignmentLinkCard,
    },
    data() {
        return {
            cardNames: [
                "AssignmentDetailsCard",
                "GroupUploadCard",
                "DocumentTypeCard",
                "PublishAssignmentCard",
                "HandInAssignmentCard",
                "StartDateReviewCard",
                "DueDateReviewCard",
                "DueDateReviewEvaluationCard",
                "AssignmentFileCard",
                "AssignmentLinkCard",
            ],
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
