<template>
    <div>
        <component
            v-if="simpleMode"
            :assignment="assignment"
            @next-card="nextCard"
            @prev-card="prevCard"
            @switch-mode="switchMode"
            :is="cardNames[currCardIndex]"
        ></component>
        <AssignmentForm
            v-else
            :assignment="assignment"
            :simpleModeButton="showSimpleModeButton"
            @submitted="onSubmit"
            @switch-mode="switchMode"
        />
    </div>
</template>

<script>
import AssignmentDetailsCard from "@/components/teacher-dashboard/wizard/cards/AssignmentDetailsCard.vue"
import DocumentTypeCard from "@/components/teacher-dashboard/wizard/cards/DocumentTypeCard.vue"
import PublishAssignmentCard from "@/components/teacher-dashboard/wizard/cards/PublishAssignmentCard.vue"
import AssignmentFileCard from "@/components/teacher-dashboard/wizard/cards/AssignmentFileCard.vue"
import DueDateReviewEvaluationCard from "@/components/teacher-dashboard/wizard/cards/DueDateReviewEvaluationCard.vue"
import StartDateReviewCard from "@/components/teacher-dashboard/wizard/cards/StartDateReviewCard.vue"
import AssignmentForm from "@/components/teacher-dashboard/assignments/AssignmentForm.vue"
export default {
    name: "wizard",
    components: {
        AssignmentDetailsCard,
        DocumentTypeCard,
        PublishAssignmentCard,
        StartDateReviewCard,
        DueDateReviewEvaluationCard,
        AssignmentFileCard,
        AssignmentForm,
    },
    props: ["assignment"],
    data() {
        return {
            cardNames: [
                "AssignmentDetailsCard",
                "DocumentTypeCard",
                "PublishAssignmentCard",
                "StartDateReviewCard",
                "DueDateReviewEvaluationCard",
                "AssignmentFileCard",
            ],
            currCardIndex: 0,
            simpleMode: true,
            showSimpleModeButton: true,
        }
    },
    methods: {
        nextCard() {
            if (this.currCardIndex < this.cardNames.length - 1) {
                this.currCardIndex++
            } else {
                this.onSubmit(this.assignment)
            }
        },
        prevCard() {
            if (this.currCardIndex > 0) {
                this.currCardIndex--
            }
        },
        switchMode() {
            this.simpleMode = !this.simpleMode
        },
        onSubmit() {
            let publishDate = this.constructDate(this.assignment.publishDay, this.assignment.publishTime)
            let dueDate = this.constructDate(this.assignment.dueDay, this.assignment.dueTime)
            let reviewPublishDate = this.constructDate(
                this.assignment.reviewPublishDay,
                this.assignment.reviewPublishTime
            )
            let reviewDueDate = this.constructDate(this.assignment.reviewDueDay, this.assignment.reviewDueTime)
            let reviewEvaluationDueDate = null
            if (this.assignment.reviewEvaluation) {
                reviewEvaluationDueDate = this.constructDate(
                    this.assignment.reviewEvaluationDueDay,
                    this.assignment.reviewEvaluationDueTime
                )
            }
            this.$emit("submitted", {
                publishDate,
                dueDate,
                reviewPublishDate,
                reviewDueDate,
                reviewEvaluationDueDate,
            })
        },
        constructDate(day, time) {
            // construct the full date
            const date = new Date()
            date.setFullYear(day.getFullYear(), day.getMonth(), day.getDate())
            date.setHours(time.split(":")[0])
            date.setMinutes(time.split(":")[1])
            date.setSeconds(0)
            date.setMilliseconds(0)
            return date
        },
    },
}
</script>
