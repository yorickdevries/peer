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
                    <b-row class="px-3 pt-3">
                            <b-col class="text-center border-right border-bottom">
                                <router-link :to=" { name: 'student-dashboard.assignment.hand-in' }">
                                    <div class="lead font-weight-bold">Hand-In - <span class="text-success">Open</span></div>
                                    <div class="text-muted">Due: 20 Nov 23:57</div>
                                </router-link>
                            </b-col>
                        <b-col class="text-center border-right border-bottom">
                            <router-link :to=" { name: 'student-dashboard.assignment.peer-review' }">
                                <div class="lead font-weight-bold">Peer Review - <span class="text-danger">Closed</span></div>
                                <span class="text-muted">Due: 20 Nov 23:58</span>
                            </router-link>
                        </b-col>
                        <b-col class="text-center border-bottom pb-3">
                            <router-link :to=" { name: 'student-dashboard.assignment.feedback' }">
                                <div class="lead font-weight-bold ">Received Feedback - <span class="text-danger">Closed</span></div>
                                <span class="text-muted">Due: 20 Nov 23:59</span>
                            </router-link>
                        </b-col>
                    </b-row>

                    <b-card-body class="">
                        <b-row>
                            <b-col>
                                <router-view></router-view>
                            </b-col>
                        </b-row>
                    </b-card-body>
                </b-card>
            </b-col>
        </b-row>

    </b-container>
</template>

<script>
export default {
    async created() {
        this.items = [
            {
                text: this.course.name,
                active: true,
            },
            {
                text: 'Assignments',
                active: true
            },
            {
                text: this.assignment.title,
                active: true
            }
        ]
    },
    data() {
        return {
            items: [],
            course: {
                id: 1,
                name: "ED-3",
                description: null
            },
            assignment: {
                title: "Assignment 1",
                description: "Example assignment number one",
                due_date: "2018-05-01T20:30:00.000Z",
                publish_date: "2018-04-01T20:30:00.000Z",
                id: 1,
                course_id: 1
            }
        }
    }
}
</script>

