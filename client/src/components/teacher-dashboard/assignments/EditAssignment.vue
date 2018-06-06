<template>
    <div>
        <b-container>

            <!--Header-->
            <b-row>
                <b-col>
                    <h1 class="mt-5">Edit {{assignment.title}}</h1>
                </b-col>
            </b-row>

            <!--Create course card-->
            <b-row>
                <b-col>
                    <b-card>
                        <b-form @submit.prevent="onSubmit">
                            <b-form-group label="Name">
                                <b-form-input   v-model="assignment.title"
                                                type="text"
                                                placeholder="Please enter the course name here"
                                                required>
                                </b-form-input>
                            </b-form-group>
                            <b-form-group label="Description">
                                <b-form-textarea    v-model="assignment.description"
                                                    id="textareadescription"
                                                    placeholder="Please enter the course description here"
                                                    :rows="4"
                                                    resquired>
                                </b-form-textarea>
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
                            <b-form-group label="Due date and time">
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
                            <b-button type="submit" variant="primary">Save changes</b-button>
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
            assignment: {
                id: null,
                title: null,
                description: null,
                course_id: null,
                publish_date: null,
                publish_day: null,
                publish_time: null,
                due_date: null,
                due_day: null,
                due_time: null,
                review_publish_date: null,
                review_publish_day: null,
                review_publish_time: null,
                review_due_date: null,
                review_due_day: null,
                review_due_time: null,
                reviews_per_user: null,
                filename: null
            },
            course: {
                id: null,
                name: null,
                description: null
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
        let cid = this.$route.params.courseId
        let aid = this.$route.params.assignmentId
        this.course.id = cid
        this.assignment.id = aid
        let res = await api.getAssignment(aid)
        this.assignment = res.data

        // Decompose datetime into date and time
        let ptime = res.data.publish_date.split('T')[1].substring(0,5)
        let dtime = res.data.due_date.split('T')[1].substring(0,5)
        let rptime = res.data.review_publish_date.split('T')[1].substring(0,5)
        let rdtime = res.data.review_due_date.split('T')[1].substring(0,5)
        this.assignment.publish_day = res.data.publish_date.split('T')[0]
        this.assignment.publish_time = ptime
        this.assignment.due_day = res.data.due_date.split('T')[0]
        this.assignment.due_time = dtime
        this.assignment.review_publish_day = res.data.review_publish_date.split('T')[0]
        this.assignment.review_publish_time = rptime
        this.assignment.review_due_day = res.data.review_due_date.split('T')[0]
        this.assignment.review_due_time = rdtime
    },
    methods: {
        async onSubmit() {
            let res = await api.saveAssignment(this.assignment.id, this.assignment)
            console.log(this.course)
            console.log(res)
            this.$router.push({name: 'teacher-dashboard.assignments.assignment', params: {courseId: this.course.id, assignmentId: this.assignment.id} })
        },
        formatDate(date) {
            // Formats the date to a readable format for the UI.
            if (!(date instanceof Date)) date = new Date(date)
            return `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}`
        }
    }

}
</script>