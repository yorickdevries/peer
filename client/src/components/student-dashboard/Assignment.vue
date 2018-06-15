<template>
    <b-container>
        <b-row>
            <b-col>
                <BreadcrumbTitle :items="['Assignments', assignment.title]" class="mt-3"/>
            </b-col>
        </b-row>
        <b-row>

            <b-col cols="12">

                <b-card no-body>

                    <b-row class="px-3 pt-0">

                        <b-col class="p-0 d-flex flex-wrap">

                            <b-button   variant="white"
                                        class="flex-fill p-0"
                                        :to="{ name: 'student-dashboard.course.assignment.information' }">
                                <div class="text-center border-right border-bottom active py-3 h-100 align-middle">
                                    <div class="lead font-weight-bold align-middle">Assignment</div>
                                    <div class="text-muted">Information</div>
                                </div>

                            </b-button>

                            <b-button variant="white"
                                    active-class="bg-light"
                                    class="flex-fill p-0"
                                    :to="{ name: 'student-dashboard.course.assignment.hand-in' }"
                                    :disabled="!isHandInActive">
                                <div class="text-center border-right border-bottom active py-3">
                                    <div class="lead font-weight-bold">Submission
                                        <b-badge variant="success" v-if="isHandInActive">Open</b-badge>
                                        <b-badge variant="danger" v-else>Closed</b-badge>
                                    </div>
                                    <div class="text-muted">Due: {{ assignment.due_date | formatDate }}</div>
                                </div>
                            </b-button>

                            <b-button   variant="white"
                                        active-class="bg-light"
                                        class="flex-fill p-0"
                                    :to="{ name: 'student-dashboard.course.assignment.peer-review' }"
                                    :disabled="!isPeerReviewActive">
                                <div class="text-center border-right border-bottom py-3">
                                    <div class="lead font-weight-bold">Peer Review
                                        <b-badge variant="success" v-if="isPeerReviewActive">Open</b-badge>
                                        <b-badge variant="danger" v-else>Closed</b-badge>
                                    </div>
                                    <span class="text-muted">Due: {{ assignment.due_date | formatDate }}</span>
                                </div>
                            </b-button>

                            <b-button   variant="white"
                                        active-class="bg-light"
                                        class="flex-fill p-0"
                                    :to="{ name: 'student-dashboard.course.assignment.feedback' }"
                                    :disabled="!isFeedbackActive">
                                <div class="text-center border-bottom py-3">
                                    <div class="lead font-weight-bold ">Received Feedback
                                        <b-badge variant="success" v-if="isFeedbackActive">Open</b-badge>
                                        <b-badge variant="danger" v-else>Closed</b-badge>
                                    </div>
                                    <span class="text-muted">Opens after {{ assignment.review_due_date | formatDate }}</span>
                                </div>
                            </b-button>
                        </b-col>

                    </b-row>

                    <b-card-body>
                        <b-row>
                            <b-col>
                                <keep-alive><router-view></router-view></keep-alive>
                            </b-col>
                        </b-row>
                    </b-card-body>

                </b-card>
            </b-col>
        </b-row>

    </b-container>
</template>

<script>
import api from "../../api"
import BreadcrumbTitle from '../BreadcrumbTitle'

export default {
    name: 'Assignment',
    components: {BreadcrumbTitle},
    data() {
        return {
            assignment: {
                title: null,
                due_date: null,
                review_due_date: null
            },
        }
    },
    computed: {
        isHandInActive() {
            return new Date() < new Date(this.assignment.due_date)
        },
        isPeerReviewActive() {
            return new Date() < new Date(this.assignment.review_due_date)
        },
        isFeedbackActive() {
            return new Date() > new Date(this.assignment.review_due_date)
        }
    },
    async created() {
        // Fetch the assignment.
        await this.fetchAssignment()
    },
    methods: {
        async fetchAssignment() {
            // Fetch the assignment information.
            let { data } = await api.getAssignment(this.$route.params.assignmentId)
            this.assignment = data
        }
    }
}
</script>


