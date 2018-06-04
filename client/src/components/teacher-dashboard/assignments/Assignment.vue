<template>
    <div>
        <b-container>

            <b-row>
                <b-col>
                    <div class="d-flex align-items-center mt-5">
                        <span class="h1 w-100">{{assignment.title}}</span>
                        <b-button variant="success"
                                  :to="{ name: 'teacher-dashboard.assignments.assignment.edit', params: {courseId: course.id, assignmentId: assignment.id} }">
                            Edit assignment
                        </b-button>
                    </div>

                </b-col>
            </b-row>

            <b-row>
                <b-col>
                    <b-card no-body>
                        <b-tabs card>
                            <b-tab title="Details" active>
                                <b-list-group flush>
                                    <b-list-group-item class="flex-column align-items-start">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h5 class="mb-1">Description</h5>
                                        </div>
                                        <p class="mb-1">
                                            {{assignment.description}}
                                        </p>
                                    </b-list-group-item>
                                    <b-list-group-item class="flex-column align-items-start">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h5 class="mb-1">Publish date</h5>
                                        </div>
                                        <p class="mb-1">
                                            {{formatDate(assignment.publish_date)}}
                                        </p>
                                    </b-list-group-item>
                                    <b-list-group-item class="flex-column align-items-start">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h5 class="mb-1">Due date</h5>
                                        </div>
                                        <p class="mb-1">
                                            {{formatDate(assignment.due_date)}}
                                        </p>
                                    </b-list-group-item>
                                </b-list-group>
                            </b-tab>
                        </b-tabs>
                    </b-card>
                </b-col>
            </b-row>


        </b-container>
    </div>
</template>

<script>
import api from '../../../api'

export default {
    async created() {
        let cid = this.$route.params.courseId
        let aid = this.$route.params.assignmentId
        this.course.id = cid
        this.assignment.id = aid
        let res = await api.getAssignment(aid)
        this.assignment = res.data
    },
    data() {
        return {
            course: {
                id: null
            },
            assignment: {
                id: null,
                title: null,
                description: null,
                publish_date: null,
                due_date: null,
                filename: null
            },
        }
    },
    methods: {
        formatDate(date) {
            // Formats the date to a readable format for the UI.
            if (!(date instanceof Date)) date = new Date(date)
            return `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}`
        }
    }
}
</script>
