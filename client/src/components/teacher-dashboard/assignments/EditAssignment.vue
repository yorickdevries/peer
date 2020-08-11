<template>
    <div>
        <b-container>
            <!--Header-->
            <b-row>
                <b-col>
                    <h1 class="mt-5">Edit {{ assignment.name }}</h1>
                </b-col>
            </b-row>

            <!--Edit course card-->
            <b-row>
                <b-col>
                    <b-card>
                        <b-form @submit.prevent="onSubmit">
                            <!--Assignment title-->
                            <b-form-group label="Assignment title">
                                <b-form-input
                                    v-model="assignment.name"
                                    type="text"
                                    placeholder="Please enter the course name here"
                                    required
                                >
                                </b-form-input>
                            </b-form-group>
                            <!--Assignment description-->
                            <b-form-group label="Description">
                                <b-form-textarea
                                    v-model="assignment.description"
                                    id="textareadescription"
                                    placeholder="Please enter the course description here"
                                    :rows="4"
                                    required
                                >
                                </b-form-textarea>
                            </b-form-group>

                            <hr />

                            <!--Publish and due date of the assignment-->
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
                                        ></datepicker>
                                        <b-form-input
                                            v-model="assignment.publishTime"
                                            type="time"
                                            placeholder="00:00"
                                            required
                                        >
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
                                        <datepicker placeholder="Select date" v-model="assignment.dueDay"></datepicker>
                                        <b-form-input
                                            v-model="assignment.dueTime"
                                            type="time"
                                            placeholder="00:00"
                                            required
                                        >
                                        </b-form-input>
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
                                        ></datepicker>
                                        <b-form-input
                                            v-model="assignment.reviewPublishTime"
                                            type="time"
                                            placeholder="00:00"
                                            required
                                        >
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
                                        ></datepicker>
                                        <b-form-input
                                            v-model="assignment.reviewDueTime"
                                            type="time"
                                            placeholder="00:00"
                                            required
                                        >
                                        </b-form-input>
                                    </b-form-group>
                                </b-col>
                            </b-row>

                            <hr />

                            <!--Number of peer reviews per student-->
                            <b-form-group label="Number of reviews that each student needs to do">
                                <b-form-input
                                    v-model="assignment.reviewsPerUser"
                                    type="number"
                                    :state="checkPeerNumber"
                                    placeholder="Enter an integer larger than 0"
                                    required
                                >
                                </b-form-input>
                            </b-form-group>

                            <!--File upload-->
                            <b-form-group label="Assignment file" class="mb-3">
                                <!--Show currently uploaded file-->
                                <b-alert class="d-flex justify-content-between flex-wrap" show variant="secondary">
                                    <div v-if="assignment.file">
                                        You currently have uploaded the file: <br /><a
                                            :href="assignmentFilePath"
                                            :download="assignment.file"
                                            target="_blank"
                                            >{{ assignment.file.name }}{{ assignment.file.extension }}</a
                                        >
                                    </div>
                                    <p v-else class="text-danger mb-0">You did not upload a file yet</p>
                                    <!--Buttons for toggling new assignment upload-->
                                    <b-button v-if="!uploadNewFile" variant="success" @click="uploadNewFile = true"
                                        >Change file</b-button
                                    >
                                    <b-button
                                        v-else
                                        variant="danger"
                                        @click="
                                            uploadNewFile = false
                                            file = null
                                            fileProgress = 0
                                        "
                                        >Cancel</b-button
                                    >
                                </b-alert>
                                <b-form-file
                                    v-if="uploadNewFile"
                                    placeholder="Choose a new file..."
                                    accept=".pdf,.zip,.doc,.docx"
                                    v-model="file"
                                    :state="Boolean(file)"
                                >
                                </b-form-file>
                                <p class="mb-0" v-if="uploadNewFile && file">
                                    File will be uploaded when you press the "save changes" button
                                </p>
                            </b-form-group>

                            <!--File link-->
                            <b-form-group
                                label="Assignment link"
                                description="Add a link where the assignment can be found for the student (optional)."
                            >
                                <b-form-input v-model="assignment.externalLink"></b-form-input>
                            </b-form-group>

                            <b-form-group
                                label="Assignment Type"
                                description="This can not be changed after creating the assignment."
                            >
                                <b-form-radio-group
                                    v-model="assignment.enrollable"
                                    :options="[
                                        { value: true, text: 'Individual' },
                                        { value: false, text: 'Group' }
                                    ]"
                                    stacked
                                    disabled
                                    name="radiosStacked"
                                >
                                </b-form-radio-group>
                            </b-form-group>
                            <b-row>
                                <b-col>
                                    <b-form-group
                                        label="Students can evaluate their received reviews"
                                        description="This can not be changed after creating the assignment."
                                    >
                                        <b-form-checkbox v-model="assignment.reviewEvaluation" disabled>
                                            Enable review evaluation
                                            <b-badge
                                                v-b-tooltip.hover
                                                title="This will enable students to fill in a non-customisable evaluation form about their received reviews"
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
                                        ></datepicker>
                                        <b-form-input
                                            v-model="assignment.reviewEvaluationDueTime"
                                            type="time"
                                            placeholder="00:00"
                                            required
                                        >
                                        </b-form-input>
                                    </b-form-group>
                                </b-col>
                                <b-col></b-col>
                            </b-row>

                            <b-button type="submit" variant="primary">Save changes</b-button>
                        </b-form>
                    </b-card>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import api from "../../../api/api_temp"
import notifications from "../../../mixins/notifications"
import Datepicker from "vuejs-datepicker"

export default {
    mixins: [notifications],
    components: {
        Datepicker
    },
    data() {
        return {
            file: null,
            fileProgress: 0,
            uploadNewFile: false,
            acceptFiles: ".pdf,.zip,.doc,.docx",
            assignment: {
                id: null,
                title: null,
                description: null,
                courseId: null,
                publishDate: null,
                publishDay: null,
                publishTime: null,
                dueDate: null,
                dueDay: null,
                dueTime: null,
                reviewPublishDate: null,
                reviewPublishDay: null,
                reviewPublish_time: null,
                reviewDueDate: null,
                reviewDueDay: null,
                reviewDueTime: null,
                reviewEvaluationDueDay: null,
                reviewEvaluationDueTime: null,
                reviewEvaluationDueDate: null,
                reviewsPerUser: null,
                file: null,
                enrollable: null,
                reviewEvaluation: null,
                externalLink: null
            },
            course: {
                id: null,
                name: null,
                description: null
            }
        }
    },
    computed: {
        checkPeerNumber() {
            if (this.assignment.reviewsPerUser == null) return null
            else return this.assignment.reviewsPerUser > 0
        },
        assignmentFilePath() {
            // Get the assignment file path.
            return `/api/assignments/${this.assignment.id}/file`
        }
    },
    async created() {
        // Load necessary data
        let cid = this.$route.params.courseId
        let aid = this.$route.params.assignmentId
        this.course.id = cid
        this.assignment.id = aid
        let res = await api.getAssignment(aid)
        this.assignment = res.data

        // Define function for correct formatting time
        function timeToInputFormat(time) {
            let str = ""
            str =
                time.getHours() < 10
                    ? str + "0" + time.getHours().toString() + ":"
                    : str + time.getHours().toString() + ":"
            str = time.getMinutes() < 10 ? str + "0" + time.getMinutes().toString() : str + time.getMinutes().toString()
            return str
        }

        // Load publish date and time
        let pdate = new Date(res.data.publishDate)
        this.assignment.publishDay = pdate
        this.assignment.publishTime = timeToInputFormat(pdate)

        // Load due date and time
        let ddate = new Date(res.data.dueDate)
        this.assignment.dueDay = ddate
        this.assignment.dueTime = timeToInputFormat(ddate)

        // Load review publish date and time
        let rpdate = new Date(res.data.reviewPublishDate)
        this.assignment.reviewPublishDay = rpdate
        this.assignment.reviewPublishTime = timeToInputFormat(rpdate)

        // Load review due date and time
        let rddate = new Date(res.data.reviewDueDate)
        this.assignment.reviewDueDay = rddate
        this.assignment.reviewDueTime = timeToInputFormat(rddate)

        // Load review evaluation due date and time
        let reddate = new Date(res.data.reviewEvaluationDueDate)
        this.assignment.reviewEvaluationDueDay = reddate
        this.assignment.reviewEvaluationDueTime = timeToInputFormat(reddate)
    },
    methods: {
        async onSubmit() {
            // Check for empty date and time fields
            let validationResult1 = this.checkFormat()
            if (validationResult1.error) {
                this.showErrorMessage({ text: validationResult1.error })
            } else {
                // Load date from fields in variables of type Date
                // Note that these are only the dates, not the times, as these are in different input fields
                let pdate = this.assignment.publishDay
                let ddate = this.assignment.dueDay
                let rpdate = this.assignment.reviewPublishDay
                let rddate = this.assignment.reviewDueDay
                let reddate = this.assignment.reviewEvaluationDueDay

                // Check for daylight saving time issues
                let validationResult2 = this.checkDST(pdate, ddate, rpdate, rddate, reddate)
                if (validationResult2.title) {
                    this.showErrorMessage({
                        title: validationResult2.title,
                        text:
                            "Due to switching to daylight saving time, you cannot choose a time between 02:00 and 02:59 on this date"
                    })
                } else {
                    // Get the hours from the input field and set in variable
                    pdate.setHours(this.assignment.publishTime.split(":")[0])
                    ddate.setHours(this.assignment.dueTime.split(":")[0])
                    rpdate.setHours(this.assignment.reviewPublishTime.split(":")[0])
                    rddate.setHours(this.assignment.reviewDueTime.split(":")[0])
                    reddate.setHours(this.assignment.reviewEvaluationDueTime.split(":")[0])

                    // Get the minutes from the input field and set in variable
                    pdate.setMinutes(this.assignment.publishTime.split(":")[1])
                    ddate.setMinutes(this.assignment.dueTime.split(":")[1])
                    rpdate.setMinutes(this.assignment.reviewPublishTime.split(":")[1])
                    rddate.setMinutes(this.assignment.reviewDueTime.split(":")[1])
                    reddate.setMinutes(this.assignment.reviewEvaluationDueTime.split(":")[1])

                    // Set the date fields of the assignment. These are now Date objects
                    // These values are the day and time of the deadline
                    this.assignment.publishDate = pdate
                    this.assignment.dueDate = ddate
                    this.assignment.reviewPublishDate = rpdate
                    this.assignment.reviewDueDate = rddate
                    this.assignment.reviewEvaluationDueDate = reddate

                    // Check order of dates
                    let validationResult3 = this.checkDatesLogical()
                    if (validationResult3.error) {
                        this.showErrorMessage({ text: validationResult3.error })
                    } else {
                        this.assignment.publishDate = pdate.toJSON()
                        this.assignment.dueDate = ddate.toJSON()
                        this.assignment.reviewPublishDate = rpdate.toJSON()
                        this.assignment.reviewDueDate = rddate.toJSON()
                        this.assignment.reviewEvaluationDueDate = reddate.toJSON()

                        // Create formData and append data
                        let formData = new FormData()
                        formData.append("name", this.assignment.name)
                        formData.append("description", this.assignment.description)
                        // formData.append("courseId", this.assignment.courseId)

                        formData.append("publishDate", this.assignment.publishDate)
                        formData.append("dueDate", this.assignment.dueDate)
                        formData.append("reviewPublishDate", this.assignment.reviewPublishDate)
                        formData.append("reviewDueDate", this.assignment.reviewDueDate)

                        formData.append("enrollable", this.assignment.enrollable)

                        // Send review evaluation date as null if not applicable
                        if (!this.assignment.reviewEvaluation) {
                            this.assignment.reviewEvaluation = "null"
                        }
                        formData.append("reviewEvaluationDueDate", this.assignment.reviewEvaluationDueDate)

                        formData.append("reviewsPerUser", this.assignment.reviewsPerUser)
                        formData.append("reviewEvaluation", this.assignment.reviewEvaluation)

                        // Send external link as null if not applicable
                        if (this.assignment.externalLink == null && this.assignment.externalLink == "") {
                            this.assignment.externalLink = "null"
                        }
                        formData.append("externalLink", this.assignment.externalLink)

                        // Add file if a new one has been uploaded
                        if (this.file != null) {
                            formData.append("file", this.file)
                        } else {
                            formData.append("file", "undefined")
                        }
                        // Update assignment in database
                        try {
                            await api.saveAssignment(this.assignment.id, formData)
                            this.showSuccessMessage({ message: "Updated assignment successfully" })
                            // Redirect to updated assignment
                            this.$router.push({
                                name: "teacher-dashboard.assignments.assignment",
                                params: { courseId: this.course.id, assignmentId: this.assignment.id }
                            })
                        } catch (e) {
                            console.log(e.response.data)
                            this.showErrorMessage({ text: e.response.data.error })
                        }
                    }
                }
            }
        },
        checkFormat() {
            // Check whether all dates and time are nonempty and conform time input format
            if (this.assignment.publishDay === null) {
                return { error: "Publish date cannot be empty!" }
            } else if (this.assignment.dueDay === null) {
                return { error: "Hand-in date cannot be empty!" }
            } else if (this.assignment.reviewPublishDay === null) {
                return { error: "Review start date cannot be empty!" }
            } else if (this.assignment.reviewDueDay === null) {
                return { error: "Review due date cannot be empty!" }
            } else if (this.assignment.reviewEvaluation && this.assignment.reviewEvaluationDueDay === null) {
                return { error: "Review evaluation due date cannot be empty!" }
            } else if (this.assignment.publishTime === "") {
                return { error: "Publish time cannot be empty!" }
            } else if (!this.checkTimeFormat(this.assignment.publishTime)) {
                return { error: "There is an error in your publish time! Format should be like 00:00" }
            } else if (this.assignment.dueTime === "") {
                return { error: "Hand-in time cannot be empty!" }
            } else if (!this.checkTimeFormat(this.assignment.dueTime)) {
                return { error: "There is an error in your hand-in time! Format should be like 00:00" }
            } else if (this.assignment.reviewPublishTime === "") {
                return { error: "Review start time cannot be empty!" }
            } else if (!this.checkTimeFormat(this.assignment.reviewPublishTime)) {
                return { error: "There is an error in your review start time! Format should be like 00:00" }
            } else if (this.assignment.reviewDueTime === "") {
                return { error: "Review due time cannot be empty!" }
            } else if (!this.checkTimeFormat(this.assignment.reviewDueTime)) {
                return { error: "There is an error in your review due time! Format should be like 00:00" }
            } else if (this.assignment.reviewEvaluation && this.assignment.reviewEvaluationDueTime === "") {
                return { error: "Review evaluation due time cannot be empty!" }
            } else if (this.assignment.reviewEvaluation && !this.checkTimeFormat(this.assignment.reviewDueTime)) {
                return { error: "There is an error in your review evaluation due time! Format should be like 00:00" }
            } else {
                return true
            }
        },
        checkTimeFormat(time) {
            var re = /^[0-2][0-9]:[0-5][0-9]$/
            console.log(re.test(time))
            return re.test(time)
        },
        checkDST(pdate, ddate, rpdate, rddate, reddate) {
            // Instantiate new dates to avoid changing the passed value
            let pdate2 = new Date(pdate)
            let ddate2 = new Date(ddate)
            let rpdate2 = new Date(rpdate)
            let rddate2 = new Date(rddate)
            let reddate2 = new Date(reddate)

            // Checking whether Daylight Saving Time is starting on the given day (changing from GMT+1 to GMT+2)
            // This causes deadlines set between 02:00 and 02:59 to be equal to 03:00-03:59 when converting to UTC
            // As a result, a deadline set at 02:00, will actually be set at 03:00
            // For some reason, Safari handles Daylight Saving Time differently. We should have a look if MomentJS can help with this issue
            if (
                pdate2.setHours(this.assignment.publishTime.split(":")[0]) ===
                pdate2.setHours(parseInt(this.assignment.publishTime.split(":")[0]) + 1)
            ) {
                return { title: "Error in publish time" }
            } else if (
                ddate2.setHours(this.assignment.dueTime.split(":")[0]) ===
                ddate2.setHours(parseInt(this.assignment.dueTime.split(":")[0]) + 1)
            ) {
                return { title: "Error in hand-in time" }
            } else if (
                rpdate2.setHours(this.assignment.reviewPublishTime.split(":")[0]) ===
                rpdate2.setHours(parseInt(this.assignment.reviewPublishTime.split(":")[0]) + 1)
            ) {
                return { title: "Error in review start time" }
            } else if (
                rddate2.setHours(this.assignment.reviewDueTime.split(":")[0]) ===
                rddate2.setHours(parseInt(this.assignment.reviewDueTime.split(":")[0]) + 1)
            ) {
                return { title: "Error in review due time" }
            } else if (
                this.assignment.reviewEvaluation &&
                reddate2.setHours(this.assignment.reviewEvaluationDueTime.split(":")[0]) ===
                    reddate2.setHours(parseInt(this.assignment.reviewEvaluationDueTime.split(":")[0]) + 1)
            ) {
                return { title: "Error in review evaluation due time" }
            } else {
                return true
            }
        },
        checkDatesLogical() {
            // Checks whether deadlines have been entered in chronological order
            // Check publish date
            if (
                this.assignment.publishDate >= this.assignment.dueDate ||
                this.assignment.publishDate >= this.assignment.reviewPublishDate ||
                this.assignment.publishDate >= this.assignment.reviewDueDate ||
                (this.assignment.reviewEvaluation &&
                    this.assignment.publishDate >= this.assignment.reviewEvaluationDueDate)
            ) {
                return { error: "Publish date should be before other dates!" }
            }
            // Check due date
            else if (
                this.assignment.dueDate >= this.assignment.reviewPublishDate ||
                this.assignment.dueDate >= this.assignment.reviewDueDate
            ) {
                return { error: "Due date should be before review dates!" }
            }
            // Show different warning in case of error with review evaluation date
            else if (
                this.assignment.reviewEvaluation &&
                this.assignment.dueDate >= this.assignment.reviewEvaluationDueDate
            ) {
                return { error: "Due date should be before review evaluation date!" }
            }
            // Check review publish date
            else if (this.assignment.reviewPublishDate >= this.assignment.reviewDueDate) {
                return { error: "Review start date should be before review due date!" }
            }
            // Show different warning in case of error with review evaluation date
            else if (
                this.assignment.reviewEvaluation &&
                this.assignment.reviewPublishDate >= this.assignment.reviewEvaluationDueDate
            ) {
                return { error: "Review start date should be before review evaluation due date!" }
            }
            // Check review evaluation date
            else if (
                this.assignment.reviewEvaluation &&
                this.assignment.reviewDueDate >= this.assignment.reviewEvaluationDueDate
            ) {
                return { error: "Review due date should be before review evaluation date" }
            }
            // Return true if all dates have been chronologically ordered
            else {
                return true
            }
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
