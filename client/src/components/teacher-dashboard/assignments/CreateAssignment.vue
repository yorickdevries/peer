<template>
    <div>
        <b-container>

            <!--Header-->
            <b-row>
                <b-col>
                    <h1 class="mt-5">Create a new assignment</h1>
                </b-col>
            </b-row>

            <!--Create assignment card-->
            <b-row>
                <b-col>
                    <b-card>
                        <b-form @submit.prevent="onSubmit">
                            <b-form-group label="Assignment title">
                                <b-form-input   v-model="assignment.title"
                                                type="text"
                                                placeholder="Please enter the assignment title here"
                                                required>
                                </b-form-input>
                            </b-form-group>
                            <b-form-group label="Description">
                                <b-form-input   v-model="assignment.description"
                                                type="text"
                                                placeholder="Please enter the assignment description here"
                                                required>
                                </b-form-input>
                            </b-form-group>
                            <b-form-group label="Publish date">
                                <b-form-input   v-model="assignment.publish_date"
                                                type="date"
                                                placeholder="Please enter on which the assignment should be published"
                                                required>
                                </b-form-input>
                            </b-form-group>
                            <b-form-group label="Due date">
                                <b-form-input   v-model="assignment.due_date"
                                                type="date"
                                                :state="checkDue"
                                                placeholder="Please enter on which the assignment should be handed in"
                                                required>
                                </b-form-input>
                                <b-form-invalid-feedback>
                                    Due date should be past publish date!
                                </b-form-invalid-feedback>
                            </b-form-group>
                            <b-form-file
                                    placeholder="Choose a file..."
                                    accept=".pdf"
                                    v-model="file"
                                    :state="Boolean(file)"
                                    v-if="uploadSuccess === null" />
                            <b-form-group label="Number of reviews that each student needs to do">
                                <b-form-input   v-model="assignment.peer_review_cap"
                                                type="number"
                                                :state="checkPeerNumber"
                                                placeholder="Enter a number between 1 and 10"
                                                required>

                                </b-form-input>
                            </b-form-group>
                            <b-button type="submit" variant="primary">Create the assignment</b-button>
                        </b-form>
                    </b-card>
                </b-col>
            </b-row>

        </b-container>
    </div>
</template>

<script>
import api from "../../../api";

export default {
    data() {
        return {
            items: [{
                text: 'Dashboard',
                to: { name: 'landing-page'}
            }, {
                text: 'Courses',
                to: { name: 'student-dashboard'}
            }],
            file: true,
            fileProgress: 0,
            uploadSuccess: null,
            acceptFiles: ".pdf",
            assignment: {
                title: null,
                description: null,
                course_id: null,
                publish_date: null,
                due_date: null,
                peer_review_cap: null
            }
        }
    },
    computed: {
        checkDue() {
            if (this.assignment.due_date == null|| this.assignment.publish_date == null)
                return null
            else
                return this.assignment.due_date > this.assignment.publish_date
        },
        checkPeerNumber() {
            if (this.assignment.peer_review_cap == null)
                return null
            else
                return this.assignment.peer_review_cap > 0 && this.assignment.peer_review_cap < 11
        }
    },
    async created() {
        this.assignment.course_id = this.$route.params.courseId
    },
    methods: {
        async onSubmit() {

            let formData = new FormData()
            formData.append("title", this.assignment.title)
            formData.append("description", this.assignment.description)
            formData.append("course_id", this.assignment.course_id)
            formData.append("publish_date", this.assignment.publish_date)
            formData.append("due_date", this.assignment.due_date)
            formData.append("assignmentFile", this.file)
            formData.append("peer_review_cap", this.assignment.peer_review_cap)

            console.log(formData)
            let res = await api.createAssignment(formData)
            console.log(this.assignment)
            console.log(res)
            this.$router.push({name: 'teacher-dashboard.assignments', params: {courseId: this.assignment.course_id}})
        }
    }
}
</script>