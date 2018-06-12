<template>
    <div>
        <b-container>

            <b-row>
                <b-col>
                    <div class="d-flex align-items-center mt-5">
                        <span class="h1 w-100">Assignment: {{assignment.title}}</span>
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
                            <b-tab title="Home" active>


                                <b-row>
                                    <b-col cols="8">
                                        <b-card header="Details">
                                            <dl class="mb-0">
                                                <dt>Description</dt>
                                                <dd>{{ assignment.description }}</dd>

                                                <dt>Publish date-time</dt>
                                                <dd>{{ assignment.publish_date | formatDate }}</dd>

                                                <dt>Assignment due date-time</dt>
                                                <dd>{{ assignment.due_date | formatDate }}</dd>

                                                <dt>Peer review publish date-time</dt>
                                                <dd>{{ assignment.review_publish_date | formatDate }}</dd>

                                                <dt>Peer review due date-tie=me</dt>
                                                <dd>{{ assignment.review_due_date | formatDate }}</dd>

                                                <dt>Amount of peer reviews assigned per student</dt>
                                                <dd>{{ assignment.reviews_per_user }}</dd>

                                                <dt>Assignment File</dt>
                                                <dd><a :href="assignmentFilePath">{{ assignment.filename }}</a></dd>
                                            </dl>
                                        </b-card>
                                    </b-col>

                                    <b-col cols="4">
                                        <b-card header="Actions">
                                            <dl class="mb-0">
                                                <dt>Shuffle groups</dt>
                                                <dd>This action will shuffle the groups and assign the groups to each
                                                    other.
                                                </dd>
                                                <b-button @click="shuffleGroups()">Shuffle Groups</b-button>

                                            </dl>
                                        </b-card>
                                    </b-col>
                                </b-row>
                            </b-tab>

                            <b-tab title="Rubric">
                                <RubricWizard :rubricId="assignment.id"></RubricWizard>
                            </b-tab>

                            <b-tab title="Groups">
                                <Groups :assignmentId="this.assignment.id"></Groups>
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
import RubricWizard from '../rubric/RubricWizard'
import Groups from '../Groups'
import notifications from '../../../mixins/notifications'

export default {
    mixins: [notifications],
    components: {
        RubricWizard,
        Groups
    },
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
                review_publish_date: null,
                review_due_date: null,
                filename: null
            },
        }
    },
    computed: {
        assignmentFilePath() {
            // Get the assignment file path.
            return `/api/assignments/${this.assignment.id}/file`
        },
    },
    methods: {
        formatDate(date) {
            // Formats the date to a readable format for the UI.
            if (!(date instanceof Date)) date = new Date(date)
            return `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}`
        },
        async shuffleGroups() {
            let res;
            try {
                res = await api.shuffleGroups(this.$route.params.assignmentId)
                this.showSuccessMessage({message: "Groups have successfully been shuffled and assigned submissions."})
            } catch (e) {
                this.showErrorMessage({message: res.data.error})
            }
        }
    }
}
</script>
