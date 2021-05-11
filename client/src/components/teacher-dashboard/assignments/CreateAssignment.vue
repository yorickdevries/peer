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
                            <b-row>
                                <b-col>
                                    <b-form-group
                                        label="Let the system automatically try to progress through the states of an assignment on deadlines"
                                        description="States are: 'unpublished', 'submission', 'waiting for review', 'review' and 'feedback'"
                                    >
                                        <b-form-checkbox v-model="assignment.automaticStateProgression">
                                            Enable Automatic State Progression
                                            <b-badge
                                                v-b-tooltip.hover
                                                title="Not clicking this will mean you have to manually progress through the states"
                                                variant="primary"
                                                >?</b-badge
                                            >
                                        </b-form-checkbox>
                                    </b-form-group>
                                </b-col>
                            </b-row>
                            <hr />
                            <!--Publish and due date of the assignment-->
                            <b-row class="mb-3">
                                <b-col>
                                    <b-alert variant="info" show>
                                        NOTE: These dates are just mean of communication to students in case automatic
                                        state progression is not set. Advancing through the assignment stages should
                                        then be done manually.
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
                                            :monday-first="true"
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
                                            :monday-first="true"
                                            required
                                        ></datepicker>
                                        <b-form-input v-model="assignment.dueTime" type="time" required> </b-form-input>
                                        <b-form-checkbox v-model="assignment.lateSubmissions">
                                            Allow late submissions after the deadline while the submission phase isn't
                                            closed yet
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
                                            :monday-first="true"
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
                                            :monday-first="true"
                                            required
                                        ></datepicker>
                                        <b-form-input v-model="assignment.reviewDueTime" type="time" required>
                                        </b-form-input>
                                        <br />
                                        <b-alert
                                            v-if="!assignment.lateSubmissionReviews || !assignment.blockFeedback"
                                            variant="danger"
                                            show
                                            >It is advised to enable late submission reviews and blocking of feedback as
                                            this encourages students to more actively make reviews.</b-alert
                                        >
                                        <b-form-checkbox v-model="assignment.lateSubmissionReviews">
                                            Allow late submission reviews indefinetely after the deadline
                                            <b-badge
                                                v-b-tooltip.hover
                                                title="Students can finish any unsubmitted reviews any time after the deadline. When feedback is open, submitted reviews cannot be unsubmitted anymore."
                                                variant="primary"
                                                >?</b-badge
                                            >
                                        </b-form-checkbox>
                                        <b-form-checkbox v-model="assignment.blockFeedback">
                                            Block feedback for students who did not finish their reviews
                                            <b-badge
                                                v-b-tooltip.hover
                                                title="Students are only allowed to access any feedback when they have submitted all their reviews."
                                                variant="primary"
                                                >?</b-badge
                                            >
                                        </b-form-checkbox>
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
                                    annotated within this website. This is a new experimental feature and some pdf's
                                    might not render, but the students can always download the submission files as well.
                                </b-alert>
                                <b-form-select
                                    :options="extensionTypes"
                                    v-model="assignment.submissionExtensions"
                                ></b-form-select>
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
                                            :monday-first="true"
                                        ></datepicker>
                                        <b-form-input v-model="assignment.reviewEvaluationDueTime" type="time">
                                        </b-form-input>
                                        <b-form-checkbox v-model="assignment.lateReviewEvaluations">
                                            Allow late review evaluations indefinetely after the deadline
                                            <b-badge
                                                v-b-tooltip.hover
                                                title="Students can finish any unsubmitted review evaluations any time after the deadline. After the deadline, submitted reviews cannot be unsubmitted anymore."
                                                variant="primary"
                                                >?</b-badge
                                            >
                                        </b-form-checkbox>
                                    </b-form-group>
                                </b-col>
                                <b-col></b-col>
                            </b-row>
                            <b-button type="submit" variant="primary" :disabled="buttonDisabled"
                                >Create the assignment</b-button
                            >
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
import moment from "moment"

export default {
    mixins: [notifications],
    components: {
        Datepicker
    },
    data() {
        return {
            assignment: {
                name: "",
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
                blockFeedback: true,
                lateSubmissions: true,
                lateSubmissionReviews: true,
                lateReviewEvaluations: true,
                automaticStateProgression: false
            },
            extensionTypes: [
                { value: ".pdf", text: ".pdf" },
                { value: ".zip", text: ".zip" },
                { value: ".pdf,.zip", text: ".pdf,.zip" },
                { value: ".doc,.docx", text: ".doc,.docx" },
                { value: ".pdf,.zip,.doc,.docx", text: ".pdf,.zip,.doc,.docx" }
            ],
            buttonDisabled: false
        }
    },
    methods: {
        async onSubmit() {
            this.buttonDisabled = true
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
                // check chronological order of the dates
                // the dates must be at least 15 minutes apart from echother
                if (
                    moment(publishDate)
                        .add(15, "minutes")
                        .isAfter(dueDate) ||
                    moment(dueDate)
                        .add(15, "minutes")
                        .isAfter(reviewPublishDate) ||
                    moment(reviewPublishDate)
                        .add(15, "minutes")
                        .isAfter(reviewDueDate) ||
                    (this.assignment.reviewEvaluation &&
                        moment(reviewDueDate)
                            .add(15, "minutes")
                            .isAfter(reviewEvaluationDueDate))
                ) {
                    throw new Error("The dates must chronologically correct and at least 15 minutes apart")
                }
            } catch (error) {
                // enable button again
                this.buttonDisabled = false
                this.showErrorMessage({ message: String(error) })
                return
            }
            // call post api
            try {
                await api.assignments.post(
                    this.assignment.name,
                    this.$route.params.courseId,
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
                    this.assignment.blockFeedback,
                    this.assignment.lateSubmissions,
                    this.assignment.lateSubmissionReviews,
                    this.assignment.lateReviewEvaluations,
                    this.assignment.automaticStateProgression
                )
                this.showSuccessMessage({ message: "Assignment was successfully created" })
                this.$router.push({
                    name: "teacher-dashboard.assignments",
                    params: { courseId: this.$route.params.courseId }
                })
            } catch (error) {
                // enable button again
                this.buttonDisabled = false
            }
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
