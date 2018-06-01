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
                                                    required>
                                </b-form-textarea>
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
                due_date: null,
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
    },
    methods: {
        async onSubmit() {
            let res = await api.saveCourse(this.course.id, this.course)
            console.log(this.course)
            console.log(res)
            this.$router.push({name: 'teacher-dashboard.course', params: {courseId: this.course.id} })
        }
    }
}
</script>