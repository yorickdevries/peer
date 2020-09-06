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
                            <!--Assignment name-->
                            <b-form-group label="Assignment name">
                                <b-form-input
                                    v-model="assignment.name"
                                    type="text"
                                    placeholder="Please enter the assignment name here"
                                    required
                                >
                                </b-form-input>
                            </b-form-group>
                            <!--Assignment description-->
                            <b-form-group label="Description">
                                <b-form-textarea
                                    v-model="assignment.description"
                                    type="text"
                                    placeholder="Please enter the assignment description here"
                                >
                                </b-form-textarea>
                            </b-form-group>
                            <hr />
                            <!--Publish and due date of the assignment-->
                            <b-row class="mb-3">
                                <b-col>
                                    <b-alert variant="info" show>
                                        NOTE: These dates are just mean of communication to students. Advancing through
                                        the assignment stages should be done manually.
                                    </b-alert>
                                </b-col>
                            </b-row>
                            <b-row class="mb-3">
                                <b-col>
                                    <b-form-group>
                                        <template slot="label">
                                            Publish date and time
                                            <b-badge
                                                v-b-tooltip.hover
                                                title="The date and time on which the assignment becomes available to the students"
                                                variant="primary"
                                                >?</b-badge
                                            >
                                        </template>
                                        <datepicker
                                            placeholder="Select date"
                                            v-model="assignment.publishDay"
                                            required
                                        ></datepicker>
                                        <b-form-input v-model="assignment.publishTime" type="time" required>
                                        </b-form-input>
                                    </b-form-group>
                                </b-col>
                                <b-col>
                                    <b-form-group>
                                        <template slot="label"
                                            >Hand-in due date and time
                                            <b-badge
                                                v-b-tooltip.hover
                                                title="The date and time before which the students have to hand in their submission"
                                                variant="primary"
                                                >?</b-badge
                                            >
                                        </template>
                                        <datepicker
                                            placeholder="Select date"
                                            v-model="assignment.dueDay"
                                            required
                                        ></datepicker>
                                        <b-form-input v-model="assignment.dueTime" type="time" required> </b-form-input>
                                        <b-form-checkbox v-model="assignment.lateSubmissions">
                                            Allow late submissions after the deadline
                                            <b-badge
                                                v-b-tooltip.hover
                                                title="This allows submissions to be made until the submission phase is manually closed by the teacher"
                                                variant="primary"
                                                >?</b-badge
                                            >
                                        </b-form-checkbox>
                                    </b-form-group>
                                </b-col>
                            </b-row>
                            <!--Publish and due date of the peer review-->
                            <b-row>
                                <b-col>
                                    <b-form-group>
                                        <template slot="label"
                                            >Start date and time for peer review(s)
                                            <b-badge
                                                v-b-tooltip.hover
                                                title="The date and time on which the students can start peer reviewing"
                                                variant="primary"
                                                >?</b-badge
                                            >
                                        </template>
                                        <datepicker
                                            placeholder="Select date"
                                            v-model="assignment.reviewPublishDay"
                                            required
                                        ></datepicker>
                                        <b-form-input v-model="assignment.reviewPublishTime" type="time" required>
                                        </b-form-input>
                                    </b-form-group>
                                </b-col>
                                <b-col>
                                    <b-form-group>
                                        <template slot="label"
                                            >Due date and time for peer review(s)
                                            <b-badge
                                                v-b-tooltip.hover
                                                title="The date and time before which the students have to submit their review(s)"
                                                variant="primary"
                                                >?</b-badge
                                            >
                                        </template>
                                        <datepicker
                                            placeholder="Select date"
                                            v-model="assignment.reviewDueDay"
                                            required
                                        ></datepicker>
                                        <b-form-input v-model="assignment.reviewDueTime" type="time" required>
                                        </b-form-input>
                                        <b-form-checkbox v-model="assignment.lateSubmissionReviews">
                                            Allow late submission reviews after the deadline
                                            <b-badge
                                                v-b-tooltip.hover
                                                title="Students can finish any unfinished reviews after the deadline. Students with unfinished reviews cannot access their feedback and are thereby motivated to finish reviews when they are late."
                                                variant="primary"
                                                >?</b-badge
                                            >
                                        </b-form-checkbox>
                                        <b-alert v-if="!assignment.lateSubmissionReviews" variant="danger" show
                                            >It is advised to enable late submission reviews because students are only
                                            allowed to access any feedback when they have submitted all their
                                            reviews.</b-alert
                                        >
                                    </b-form-group>
                                </b-col>
                            </b-row>

                            <hr />
                            <!--File upload-->
                            <b-form-group
                                label="Assignment file"
                                description="Add a file for the assignment (optional)."
                            >
                                <b-form-file
                                    placeholder="Choose a file..."
                                    accept=".pdf,.zip,.doc,.docx"
                                    :state="Boolean(assignment.file)"
                                    v-model="assignment.file"
                                >
                                </b-form-file>
                            </b-form-group>

                            <!--File link-->
                            <b-form-group
                                label="Assignment link"
                                description="Add a link where the assignment can be found for the student (optional)."
                            >
                                <b-form-input v-model="assignment.externalLink"></b-form-input>
                            </b-form-group>

                            <!--Allowed Submission extensions-->
                            <b-form-group
                                label="Allowed submission file extensions"
                                description="The extensions for the submission files that are allowed."
                            >
                                <b-alert v-if="assignment.submissionExtensions !== '.pdf'" variant="danger" show>
                                    It is advised to choose '.pdf' as extension because only those files can be directly
                                    annotated within this website. This is a new experimental feature, the students can
                                    always download the submission files as well.
                                </b-alert>
                                <b-form-select
                                    :options="extensionTypes"
                                    v-model="assignment.submissionExtensions"
                                ></b-form-select>
                            </b-form-group>

                            <!--Number of peer reviews per student-->
                            <b-form-group label="Number of reviews that each student needs to do">
                                <b-form-input
                                    v-model="assignment.reviewsPerUser"
                                    type="number"
                                    :state="checkReviewsPerUser"
                                    placeholder="Enter an integer larger than 0"
                                    required
                                >
                                </b-form-input>
                            </b-form-group>

                            <b-form-group>
                                <b-form-checkbox v-model="assignment.enrollable">
                                    Self enrollable
                                    <b-badge
                                        v-b-tooltip.hover
                                        title="Allow students to enroll themselves into groups of 1 person"
                                        variant="primary"
                                        >?</b-badge
                                    >
                                </b-form-checkbox>
                            </b-form-group>

                            <b-row>
                                <b-col>
                                    <b-form-group
                                        label="Students can evaluate their received reviews"
                                        description="This can not be changed after creating the assignment."
                                    >
                                        <b-form-checkbox v-model="assignment.reviewEvaluation">
                                            Enable review evaluation
                                            <b-badge
                                                v-b-tooltip.hover
                                                title="This will enable students to fill in a evaluation form about their received reviews"
                                                variant="primary"
                                                >?</b-badge
                                            >
                                        </b-form-checkbox>
                                    </b-form-group>
                                    <b-form-group v-if="assignment.reviewEvaluation">
                                        <b-alert variant="warning" show>
                                            NOTE: This is a hard deadline for students to be able to make review
                                            evaluations
                                        </b-alert>
                                        <template slot="label"
                                            >Review evaluation due date and time
                                            <b-badge
                                                v-b-tooltip.hover
                                                title="The date and time before which the students have to evaluate reviews. Evaluations can be done once the review deadline has passed"
                                                variant="primary"
                                                >?</b-badge
                                            >
                                        </template>
                                        <datepicker
                                            placeholder="Select date"
                                            v-model="assignment.reviewEvaluationDueDay"
                                        ></datepicker>
                                        <b-form-input v-model="assignment.reviewEvaluationDueTime" type="time">
                                        </b-form-input>
                                    </b-form-group>
                                </b-col>
                                <b-col></b-col>
                            </b-row>
                            <b-button type="submit" variant="primary">Create the assignment</b-button>
                        </b-form>
                    </b-card>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import api from "../../../api/api"
import notifications from "../../../mixins/notifications"
import Datepicker from "vuejs-datepicker"

export default {
    mixins: [notifications],
    components: {
        Datepicker
    },
    data() {
        return {
            assignment: {
                name: "",
                reviewsPerUser: null,
                enrollable: false,
                reviewEvaluation: false,
                publishDay: null,
                publishTime: "23:59",
                dueDay: null,
                dueTime: "23:59",
                reviewPublishDay: null,
                reviewPublishTime: "23:59",
                reviewDueDay: null,
                reviewDueTime: "23:59",
                reviewEvaluationDueDay: null,
                reviewEvaluationDueTime: "23:59",
                description: null,
                file: null,
                externalLink: null,
                submissionExtensions: ".pdf",
                lateSubmissions: true,
                lateSubmissionReviews: true
            },
            extensionTypes: [
                { value: ".pdf", text: ".pdf" },
                { value: ".zip", text: ".zip" },
                { value: ".doc,.docx", text: ".doc,.docx" },
                { value: ".pdf,.zip,.doc,.docx", text: ".pdf,.zip,.doc,.docx" }
            ]
        }
    },
    computed: {
        checkReviewsPerUser() {
            if (this.assignment.reviewsPerUser == null) {
                return null
            } else {
                return this.assignment.reviewsPerUser > 0
            }
        }
    },
    methods: {
        async onSubmit() {
            // these will be constructed in the try/catch
            let publishDate = null
            let dueDate = null
            let reviewPublishDate = null
            let reviewDueDate = null
            let reviewEvaluationDueDate = null
            try {
                // Check for empty date fields
                this.checkDateFormat()
                publishDate = this.constructDate(this.assignment.publishDay, this.assignment.publishTime)
                dueDate = this.constructDate(this.assignment.dueDay, this.assignment.dueTime)
                reviewPublishDate = this.constructDate(
                    this.assignment.reviewPublishDay,
                    this.assignment.reviewPublishTime
                )
                reviewDueDate = this.constructDate(this.assignment.reviewDueDay, this.assignment.reviewDueTime)
                if (this.assignment.reviewEvaluation) {
                    reviewEvaluationDueDate = this.constructDate(
                        this.assignment.reviewEvaluationDueDay,
                        this.assignment.reviewEvaluationDueTime
                    )
                }
                // Check order of dates
                if (
                    publishDate >= dueDate ||
                    dueDate >= reviewPublishDate ||
                    reviewPublishDate >= reviewDueDate ||
                    (this.assignment.reviewEvaluation && reviewDueDate >= reviewEvaluationDueDate)
                ) {
                    throw new Error("dates are not in chronological order")
                }
            } catch (error) {
                this.showErrorMessage({ message: String(error) })
                return
            }
            // call post api
            await api.assignments.post(
                this.assignment.name,
                this.$route.params.courseId,
                this.assignment.reviewsPerUser,
                this.assignment.enrollable,
                this.assignment.reviewEvaluation,
                publishDate,
                dueDate,
                reviewPublishDate,
                reviewDueDate,
                reviewEvaluationDueDate,
                this.assignment.description,
                this.assignment.externalLink,
                this.assignment.file,
                this.assignment.submissionExtensions,
                this.assignment.lateSubmissions,
                this.assignment.lateSubmissionReviews
            )
            this.showSuccessMessage({ message: "Assignment was successfully created" })
            this.$router.push({
                name: "teacher-dashboard.assignments",
                params: { courseId: this.$route.params.courseId }
            })
        },
        checkDateFormat() {
            // Check whether all dates and time are nonempty and conform time input format
            // publish
            if (!this.assignment.publishDay) {
                throw new Error("Publish date cannot be empty!")
                // due
            } else if (!this.assignment.dueDay) {
                throw new Error("Hand-in date cannot be empty!")
                // reviewPublish
            } else if (!this.assignment.reviewPublishDay) {
                throw new Error("Review start date cannot be empty!")
                // reviewDue
            } else if (!this.assignment.reviewDueDay) {
                throw new Error("Review due date cannot be empty!")
                // reviewEvaluationDue
            } else if (this.assignment.reviewEvaluation && !this.assignment.reviewEvaluationDueDay) {
                throw new Error("Review evaluation due date cannot be empty!")
            } else {
                return
            }
        },
        constructDate(day, time) {
            const re = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
            if (!re.test(time)) {
                throw new Error(`invalid time: ${time}`)
            }
            // construct the full date
            const date = new Date()
            date.setFullYear(day.getFullYear(), day.getMonth(), day.getDate())
            date.setHours(time.split(":")[0])
            date.setMinutes(time.split(":")[1])
            date.setSeconds(0)
            date.setMilliseconds(0)
            return date
        }
    }
}
</script>

<style>
/*Style for the datepicker component to look like our style*/
input,
select {
    display: block;
    width: 100%;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}
</style>
