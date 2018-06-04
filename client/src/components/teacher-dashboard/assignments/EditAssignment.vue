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
                                <b-form-input   v-model="assignment.publish_date"
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
                                <b-form-input   v-model="assignment.due_date"
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
                publish_date: null,
                publish_time: null,
                due_date: null,
                due_time: null,
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
        }
    },
    async created() {
        let cid = this.$route.params.courseId
        let aid = this.$route.params.assignmentId
        this.course.id = cid
        this.assignment.id = aid
        let res = await api.getAssignment(aid)
        this.assignment = res.data
        let ptime = res.data.publish_date.split('T')[1].substring(0,5)
        let dtime = res.data.due_date.split('T')[1].substring(0,5)
        this.assignment.publish_date = res.data.publish_date.split('T')[0]
        this.assignment.publish_time = ptime
        this.assignment.due_date = res.data.due_date.split('T')[0]
        this.assignment.due_time = dtime
    },
    methods: {
        async onSubmit() {
            let res = await api.saveCourse(this.course.id, this.course)
            console.log(this.course)
            console.log(res)
            this.$router.push({name: 'teacher-dashboard.course', params: {courseId: this.course.id} })
        },
        formatDate(date) {
            // Formats the date to a readable format for the UI.
            if (!(date instanceof Date)) date = new Date(date)
            return `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}`
        }
    }

}
</script>