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
                            <!--Assignment title-->
                            <b-form-group label="Assignment title">
                                <b-form-input   v-model="assignment.title"
                                                type="text"
                                                placeholder="Please enter the assignment title here"
                                                required>
                                </b-form-input>
                            </b-form-group>
                            <!--Assignment description-->
                            <b-form-group label="Description">
                                <b-form-input   v-model="assignment.description"
                                                type="text"
                                                placeholder="Please enter the assignment description here"
                                                required>
                                </b-form-input>
                            </b-form-group>

                            <hr />

                            <!--Publish and due date of the assignment-->
                            <b-row class="mb-3">
                                <b-col>
                                    <!--{{assignment.publish_day}}-->
                                    <b-form-group>
                                        <template slot="label"> Publish date and time
                                            <b-badge v-b-tooltip.hover title="The date and time on which the assignment becomes available to the students" variant="primary">?</b-badge>
                                        </template>
                                        <datepicker placeholder="Select Date" v-model="assignment.publish_day"></datepicker>
                                        <!--<b-form-input   v-model="assignment.publish_day"-->
                                                        <!--type="date"-->
                                                        <!--placeholder="Please enter date on which the assignment should be published"-->
                                                        <!--required>-->
                                        <!--</b-form-input>-->
                                        <!--{{assignment.publish_time}}-->
                                        <b-form-input   v-model="assignment.publish_time"
                                                        type="time"
                                                        placeholder="Please enter time on which the assignment should be published"
                                                        required>
                                        </b-form-input>
                                    </b-form-group>
                                </b-col>
                                <b-col>
                                    <b-form-group>
                                        <template slot="label">Hand-in due date and time
                                            <b-badge v-b-tooltip.hover title="The date and time before which the students have to hand in their submission" variant="primary">?</b-badge>
                                        </template>
                                        <datepicker placeholder="Select Date" v-model="assignment.due_day"></datepicker>
                                        <!--<b-form-input   v-model="assignment.due_day"-->
                                                        <!--type="date"-->
                                                        <!--placeholder="Please enter date on which the assignment should be handed in"-->
                                                        <!--required>-->
                                        <!--</b-form-input>-->
                                        <b-form-input   v-model="assignment.due_time"
                                                        type="time"
                                                        placeholder="Please enter time before which the assignment should be handed in"
                                                        required>
                                        </b-form-input>
                                    </b-form-group>
                                </b-col>
                            </b-row>

                            <!--Publish and due date of the peer review-->
                            <b-row>
                                <b-col>
                                    <b-form-group>
                                        <template slot="label">Start date and time for peer review(s)
                                            <b-badge v-b-tooltip.hover title="The date and time on which the students can start peer reviewing" variant="primary">?</b-badge>
                                        </template>
                                        <datepicker placeholder="Select Date" v-model="assignment.review_publish_day"></datepicker>
                                        <!--<b-form-input   v-model="assignment.review_publish_day"-->
                                                        <!--type="date"-->
                                                        <!--placeholder="Please enter start date of the peer review"-->
                                                        <!--required>-->
                                        <!--</b-form-input>-->
                                        <b-form-input   v-model="assignment.review_publish_time"
                                                        type="time"
                                                        placeholder="Please enter start time of the peer review"
                                                        required>
                                        </b-form-input>
                                    </b-form-group>
                                </b-col>
                                <b-col>
                                    <b-form-group>
                                        <template slot="label">Due date and time for peer review(s)
                                            <b-badge v-b-tooltip.hover title="The date and time before which the students have to submit their review(s)" variant="primary">?</b-badge>
                                        </template>
                                        <datepicker placeholder="Select Date" v-model="assignment.review_due_day"></datepicker>
                                        <!--<b-form-input   v-model="assignment.review_due_day"-->
                                                        <!--type="date"-->
                                                        <!--placeholder="Please enter due date of the peer review"-->
                                                        <!--required>-->
                                        <!--</b-form-input>-->
                                        <b-form-input   v-model="assignment.review_due_time"
                                                        type="time"
                                                        placeholder="Please enter due time of the peer review"
                                                        required>
                                        </b-form-input>
                                    </b-form-group>
                                </b-col>
                            </b-row>

                            <hr />

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
                                        accept=".pdf,.zip"
                                        v-model="file"
                                        :state="Boolean(file)"
                                        v-if="uploadSuccess === null">
                                </b-form-file>
                            </b-form-group>

                            <b-form-group   label="Assignment Type"
                                            description="This can not be changed after creating the assignment.">
                                <b-form-radio-group v-model="assignment.one_person_groups"
                                                    :options="[
                                                        { value: true, text: 'Individual'},
                                                        { value: false, text: 'Group'}
                                                    ]"
                                                    stacked
                                                    name="radiosStacked">
                                </b-form-radio-group>
                            </b-form-group>

                            <b-form-group   label="Students can evaluate their received reviews"
                                            description="This can not be changed after creating the assignment.">
                                <b-form-checkbox
                                        v-model="assignment.review_evaluation">
                                    Enable Review evaluation.
                                </b-form-checkbox>
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
import notifications from '../../../mixins/notifications'
import Datepicker from 'vuejs-datepicker'

export default {
    mixins: [notifications],
    components: {
        Datepicker
    },
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
            acceptFiles: ".pdf,.zip",
            assignment: {
                title: null,
                description: null,
                course_id: null,
                publish_day: null,
                publish_time: "23:59",
                publish_date: null,
                due_day: null,
                due_time: "23:59",
                due_date: null,
                review_publish_day: null,
                review_publish_time: "23:59",
                review_publish_date: null,
                review_due_day: null,
                review_due_time: "23:59",
                review_due_date: null,
                reviews_per_user: null,
                one_person_groups: false,
                review_evaluation: false
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
        checkDates() {
            if (this.assignment.publish_date > this.assignment.due_date || this.assignment.publish_date > this.assignment.review_publish_date || this.assignment.publish_date > this.assignment.review_due_date) {
                return {error: 'Publish date is later than other dates!'}
            } else if (this.assignment.due_date > this.assignment.review_publish_date || this.assignment.due_date > this.assignment.review_due_date) {
                return {error: 'Due date is later than review dates!'}
            } else if (this.assignment.review_publish_date > this.assignment.review_due_date) {
                return {error: 'Review start date is later than review due dates!'}
            } else {
                return true
            }

        },
        async onSubmit() {

            let pdate = new Date(this.assignment.publish_day + " " + this.assignment.publish_time).toJSON();
            let ddate = new Date(this.assignment.due_day + " " + this.assignment.due_time).toJSON();
            let rpdate = new Date(this.assignment.review_publish_day + " " + this.assignment.review_publish_time).toJSON();
            let rddate = new Date(this.assignment.review_due_day + " " + this.assignment.review_due_time).toJSON();

            this.assignment.publish_date = pdate
            this.assignment.due_date = ddate
            this.assignment.review_publish_date = rpdate
            this.assignment.review_due_date = rddate

            let validationResult = this.checkDates()
            if (validationResult.error) {
                this.showErrorMessage({message: validationResult.error})
            } else {
                let formData = new FormData()
                formData.append("title", this.assignment.title)
                formData.append("description", this.assignment.description)
                formData.append("course_id", this.assignment.course_id)

                formData.append("publish_date", pdate)
                formData.append("due_date", ddate)
                formData.append("review_publish_date", rpdate)
                formData.append("review_due_date", rddate)
                formData.append("assignmentFile", this.file)
                formData.append("reviews_per_user", this.assignment.reviews_per_user)
                formData.append("one_person_groups", this.assignment.one_person_groups)
                formData.append("review_evaluation", this.assignment.review_evaluation)

                try {
                    await api.createAssignment(formData)
                    this.showSuccessMessage({message: "Assignment was successfully created"})
                    this.$router.push({name: 'teacher-dashboard.assignments', params: {courseId: this.assignment.course_id}})
                } catch (e) {
                    this.showErrorMessage({message: e.response.data.error})
                }
            }

        }
    }
}
</script>

<style>
    body {
        font-family: "Helvetica Neue Light", Helvetica, sans-serif;
        padding: 1em 2em 2em;
    }
    input,
    select {
        padding: 0.75em 0.5em;
        font-size: 100%;
        border: 1px solid #ccc;
        width: 100%;
    }

    select {
        height: 2.5em;
    }

    .example {
        background: #f2f2f2;
        border: 1px solid #ddd;
        padding: 0em 1em 1em;
        margin-bottom: 2em;
    }

    code,
    pre {
        margin: 1em 0;
        padding: 1em;
        border: 1px solid #bbb;
        display: block;
        background: #ddd;
        border-radius: 3px;
    }

    .settings {
        margin: 2em 0;
        border-top: 1px solid #bbb;
        background: #eee;
    }

    h5 {
        font-size: 100%;
        padding: 0;
    }

    .form-group {
        margin-bottom: 1em;
    }

    .form-group label {
        font-size: 80%;
        display: block;
    }
</style>