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
                            <b-form-group label="Publish date and time">
                                <b-form-input   v-model="assignment.publish_day"
                                                type="date"
                                                placeholder="Please enter date on which the assignment should be published"
                                                required>
                                </b-form-input>
                                <b-form-input   v-model="assignment.publish_time"
                                                type="time"
                                                placeholder="Please enter time on which the assignment should be published"
                                                required>
                                </b-form-input>
                            </b-form-group>
                            <b-form-group label="Hand in due date and time">
                                <b-form-input   v-model="assignment.due_day"
                                                type="date"
                                                :state="checkDue"
                                                placeholder="Please enter date on which the assignment should be handed in"
                                                required>
                                </b-form-input>
                                <b-form-input   v-model="assignment.due_time"
                                                type="time"
                                                :state="checkDue"
                                                placeholder="Please enter time before which the assignment should be handed in"
                                                required>
                                </b-form-input>
                                <b-form-invalid-feedback>
                                    Due date should be past publish date!
                                </b-form-invalid-feedback>
                            </b-form-group>
                            <b-form-group label="Start date and time for peer review">
                                <b-form-input   v-model="assignment.review_publish_day"
                                                type="date"
                                                placeholder="Please enter start date of the peer review"
                                                required>
                                </b-form-input>
                                <b-form-input   v-model="assignment.review_publish_time"
                                                type="time"
                                                placeholder="Please enter start time of the peer review"
                                                required>
                                </b-form-input>
                            </b-form-group>
                            <b-form-group label="Due date and time for peer review">
                                <b-form-input   v-model="assignment.review_due_day"
                                                type="date"
                                                placeholder="Please enter due date of the peer review"
                                                required>
                                </b-form-input>
                                <b-form-input   v-model="assignment.review_due_time"
                                                type="time"
                                                placeholder="Please enter due time of the peer review"
                                                required>
                                </b-form-input>
                            </b-form-group>
                            <b-form-group label="Number of reviews that each student needs to do">
                                <b-form-input   v-model="assignment.reviews_per_user"
                                                type="number"
                                                :state="checkPeerNumber"
                                                placeholder="Enter an integer larger than 0"
                                                required>
                                </b-form-input>
                            </b-form-group>
                            <b-form-group label="Assignment file">
                                <b-form-file
                                        placeholder="Choose a file..."
                                        accept=".pdf"
                                        v-model="file"
                                        :state="Boolean(file)"
                                        v-if="uploadSuccess === null">
                                </b-form-file>
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
                publish_day: null,
                publish_time: null,
                due_day: null,
                due_time: null,
                review_publish_day: null,
                review_publish_time: null,
                review_due_day: null,
                review_due_time: null,
                reviews_per_user: null
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
            if (this.assignment.reviews_per_user == null)
                return null
            else
                return this.assignment.reviews_per_user > 0
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
            formData.append("publish_date", this.assignment.publish_day + "T" + this.assignment.publish_time + ":00.000Z")
            formData.append("due_date", this.assignment.due_day + "T" + this.assignment.due_time + ":00.000Z")
            formData.append("review_publish_date", this.assignment.review_publish_day + "T" + this.assignment.review_publish_time + ":00.000Z")
            formData.append("review_due_date", this.assignment.review_due_day + "T" + this.assignment.review_due_time + ":00.000Z")
            formData.append("assignmentFile", this.file)
            formData.append("reviews_per_user", this.assignment.reviews_per_user)

            let res = await api.createAssignment(formData)
            console.log(this.assignment)
            console.log(res)
            this.$router.push({name: 'teacher-dashboard.assignments', params: {courseId: this.assignment.course_id}})
        }
    }
}
</script>