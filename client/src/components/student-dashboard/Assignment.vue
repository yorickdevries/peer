<template>
    <b-container>
        <b-row>
            <b-col>
                <b-breadcrumb :items="items" class="mt-3"/>
            </b-col>
        </b-row>
        <b-row>

            <b-col cols="12">

                <b-card no-body>

                    <b-row class="px-3 pt-0">
                        <router-link
                                active-class="bg-light"
                                class="col px-0"
                                tag="div"
                                :to="{ name: 'student-dashboard.course.assignment.hand-in' }">
                            <div class="text-center border-right border-bottom active py-3">
                                <div class="lead font-weight-bold">Hand-In -
                                    <span class="text-success" v-if="isHandInActive">Open</span>
                                    <span class="text-danger" v-else>Closed</span>
                                </div>
                                <div class="text-muted">Due: {{ formatDate(assignment.due_date) }}</div>
                            </div>
                        </router-link>

                        <router-link
                                active-class="bg-light"
                                class="col px-0 text-muted"
                                tag="div"
                                :to="{ name: 'student-dashboard.course.assignment.peer-review' }">

                            <div class="text-center border-right border-bottom py-3">
                                <div class="lead font-weight-bold">Peer Review -
                                    <span class="text-success" v-if="isPeerReviewActive">Open</span>
                                    <span class="text-danger" v-else>Closed</span>
                                </div>
                                <span class="text-muted">Due: {{ formatDate(assignment.peer_review_due_date) }}</span>
                            </div>
                        </router-link>

                        <router-link
                                active-class="bg-light"
                                class="col px-0 text-muted"
                                tag="div"
                                :to="{ name: 'student-dashboard.course.assignment.feedback' }">
                            <div class="text-center border-bottom py-3">
                                <div class="lead font-weight-bold ">Received Feedback -
                                    <span class="text-success" v-if="isFeedbackActive">Open</span>
                                    <span class="text-danger" v-else>Closed</span>
                                </div>
                                <span class="text-muted">Opens after {{ formatDate(assignment.peer_review_due_date) }}</span>
                            </div>
                        </router-link>

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

export default {
    name: 'Assignment',
    data() {
        return {
            items: [{
                text: 'Assignments',
                active: true
            }],
            assignment: {
                title: null,
                due_date: null,
                peer_review_due_date: null
            },
        }
    },
    computed: {
        isHandInActive() {
            return new Date() < new Date(this.assignment.due_date)
        },
        isPeerReviewActive() {
            return new Date() < new Date(this.assignment.peer_review_due_date)
        },
        isFeedbackActive() {
            return new Date() > new Date(this.assignment.peer_review_due_date)
        }
    },
    async created() {
        // Fetch the assignment.
        await this.fetchAssignment()

        // Add assignment name to breadcrumb header.
        this.items.push({
            text: this.assignment.title,
            active: true
        })

        // Temporary creation of a due date for the peer review (offset by 40).
        let tempDate = new Date(this.assignment.due_date);
        tempDate.setDate(tempDate.getDate() + 40);
        this.assignment.peer_review_due_date = tempDate
    },
    methods: {
        async fetchAssignment() {
            // Fetch the assignment information.
            let res = await api.getAssignment(this.$route.params.assignmentId)
            this.assignment = res.data
        },
        formatDate(date) {
            // Formats the date to a readable format for the UI.
            if (!(date instanceof Date)) date = new Date(date)
            return `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}`
        }
    }
}
</script>


