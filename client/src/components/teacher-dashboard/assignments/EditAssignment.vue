<template>
    <div>
        <b-container>
            <!--Header-->
            <b-row>
                <b-col>
                    <h1 class="mt-5">Edit {{assignment.title}}</h1>
                </b-col>
            </b-row>

            <!--Edit course card-->
            <b-row>
                <b-col>
                    <b-card>
                        <b-form @submit.prevent="onSubmit">
                            <!--Assignment title-->
                            <b-form-group label="Assignment title">
                                <b-form-input   v-model="assignment.title"
                                                type="text"
                                                placeholder="Please enter the course name here"
                                                required>
                                </b-form-input>
                            </b-form-group>
                            <!--Assignment description-->
                            <b-form-group label="Description">
                                <b-form-textarea    v-model="assignment.description"
                                                    id="textareadescription"
                                                    placeholder="Please enter the course description here"
                                                    :rows="4"
                                                    required>
                                </b-form-textarea>
                            </b-form-group>

                            <hr />

                            <!--Publish and due date of the assignment-->
                            <b-row class="mb-3">
                                <b-col>
                                    <b-form-group>
                                        <template slot="label"> Publish date and time
                                            <b-badge v-b-tooltip.hover title="The date and time on which the assignment becomes available to the students" variant="primary">?</b-badge>
                                        </template>
                                        <datepicker placeholder="Select date" v-model="assignment.publish_day"></datepicker>
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
                                        <datepicker placeholder="Select date" v-model="assignment.due_day"></datepicker>
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
                                        <datepicker placeholder="Select date" v-model="assignment.review_publish_day"></datepicker>
                                        <b-form-input   v-model="assignment.review_publish_time"
                                                        type="time"
                                                        placeholder="Please enter start time of the peer review"
                                                        required>
                                        </b-form-input>
                                    </b-form-group>
                                    <b-button @click="renderDates" variant="primary">Render</b-button>
                                </b-col>
                                <b-col>
                                    <b-form-group>
                                        <template slot="label">Due date and time for peer review(s)
                                            <b-badge v-b-tooltip.hover title="The date and time before which the students have to submit their review(s)" variant="primary">?</b-badge>
                                        </template>
                                        <datepicker placeholder="Select date" v-model="assignment.review_due_day"></datepicker>
                                        <b-form-input   v-model="assignment.review_due_time"
                                                        type="time"
                                                        placeholder="Please enter due time of the peer review">
                                        </b-form-input>
                                    </b-form-group>
                                </b-col>
                            </b-row>

                            <hr />

                            <!--Number of peer reviews per student-->
                            <b-form-group label="Number of reviews that each student needs to do">
                                <b-form-input   v-model="assignment.reviews_per_user"
                                                type="number"
                                                :state="checkPeerNumber"
                                                placeholder="Enter an integer larger than 0"
                                                required>
                                </b-form-input>
                            </b-form-group>

                            <!--File upload-->
                            <b-form-group label="Assignment file" class="mb-3">
                                <!--Show currently uploaded file-->
                                <b-alert class="d-flex justify-content-between flex-wrap" show variant="secondary">
                                    <div v-if="assignment.filename">You currently have uploaded the file:
                                        <br><a :href="assignmentFilePath" :download="assignment.filename"
                                               target="_blank">{{ assignment.filename }}</a>
                                    </div>
                                    <p v-else class="text-danger mb-0">You did not upload a file yet
                                    </p>
                                    <!--Buttons for toggling new assignment upload-->
                                    <b-button v-if="!uploadNewFile" variant="success" @click="uploadNewFile = true">Change file</b-button>
                                    <b-button v-else variant="danger" @click="uploadNewFile = false; file = null; fileProgress = 0">Cancel</b-button>
                                </b-alert>
                                <b-form-file  v-if="uploadNewFile"
                                              placeholder="Choose a new file..."
                                              accept=".pdf,.zip"
                                              v-model="file"
                                              :state="Boolean(file)">
                                </b-form-file>
                                <p class="mb-0" v-if="uploadNewFile && file">File will be uploaded when you press the "save changes" button</p>
                            </b-form-group>

                            <!--File link-->
                            <b-form-group label="Assignment link" description="Add a link where the assignment can be found for the student (optional).">
                                <b-form-input v-model="assignment.external_link"></b-form-input>
                            </b-form-group>

                            <b-form-group   label="Assignment Type"
                                            description="This can not be changed after creating the assignment.">
                                <b-form-radio-group v-model="assignment.one_person_groups"
                                                    :options="[
                                                        { value: true, text: 'Individual'},
                                                        { value: false, text: 'Group'}
                                                    ]"
                                                    stacked
                                                    disabled
                                                    name="radiosStacked">
                                </b-form-radio-group>
                            </b-form-group>
                            <b-row>
                                <b-col>
                                    <b-form-group   label="Students can evaluate their received reviews"
                                                    description="This can not be changed after creating the assignment.">
                                        <b-form-checkbox
                                                v-model="assignment.review_evaluation"
                                                disabled>
                                            Enable review evaluation
                                        </b-form-checkbox>
                                    </b-form-group>
                                    <b-form-group v-if="assignment.review_evaluation">
                                        <template slot="label">Review evaluation due date and time
                                            <b-badge v-b-tooltip.hover title="The date and time before which the students have to evaluate reviews. Evaluations can be done once the review deadline has passed" variant="primary">?</b-badge>
                                        </template>
                                        <datepicker placeholder="Select date" v-model="assignment.review_evaluation_due_day"></datepicker>
                                        <b-form-input   v-model="assignment.review_evaluation_due_time"
                                                        type="time"
                                                        placeholder="Please enter time before which the reviews should be evaluated"
                                                        required>
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
import api from "../../../api";
import notifications from "../../../mixins/notifications";
import Datepicker from 'vuejs-datepicker'

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
            acceptFiles: ".pdf,.zip",
            server_date: null,
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
                review_evaluation_due_day: null,
                review_evaluation_due_time: null,
                review_evaluation_due_date: null,
                reviews_per_user: null,
                filename: null,
                one_person_groups: null,
                review_evaluation: null,
                external_link: null
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
            if (this.assignment.reviews_per_user == null)
                return null
            else
                return this.assignment.reviews_per_user > 0
        },
        assignmentFilePath() {
            // Get the assignment file path.
            return `/api/assignments/${this.assignment.id}/file`
        }
    },
    async created() {
        // this.debouncedGetAnswer = function () {_.debounce(this.getAnswer, 500)}
        // Load necessary date
        let cid = this.$route.params.courseId
        let aid = this.$route.params.assignmentId
        this.course.id = cid
        this.assignment.id = aid
        let res = await api.getAssignment(aid)
        this.assignment = res.data

        // Define function for correct formatting time
        function timeToInputFormat(time) {
            let str = "";
            str = time.getHours() < 10 ? str + "0" + time.getHours().toString() + ":" : str + time.getHours().toString() + ":"
            str = time.getMinutes() < 10 ? str + "0" + time.getMinutes().toString() : str + time.getMinutes().toString()
            return str
        }

        // For testing purposes
        this.server_date = res.data.review_publish_date

        // Set publish date and time
        let pdate = new Date(res.data.publish_date)
        this.assignment.publish_day = pdate
        this.assignment.publish_time = timeToInputFormat(pdate)

        // Set due date and time
        let ddate = new Date(res.data.due_date)
        this.assignment.due_day = ddate
        this.assignment.due_time = timeToInputFormat(ddate)

        // Set review publish date and time
        let rpdate = new Date(res.data.review_publish_date)
        this.assignment.review_publish_day = rpdate
        this.assignment.review_publish_time = timeToInputFormat(rpdate)

        // Set review due date and time
        let rddate = new Date(res.data.review_due_date)
        this.assignment.review_due_day = rddate
        this.assignment.review_due_time = timeToInputFormat(rddate)

        // Set review evaluation due date and time
        let reddate = new Date(res.data.review_evaluation_due_date)
        this.assignment.review_evaluation_due_day = reddate
        this.assignment.review_evaluation_due_time = timeToInputFormat(reddate)
    },
    methods: {
        // Function for testing purposes
        async renderDates() {
            this.showDSTPublishDate = !this.showDSTPublishDate
            console.clear()
            console.log(this.server_date + " - from server")
            let rpdate = this.assignment.review_publish_day
            console.log(this.assignment.review_publish_day + " - from date field")
            // console.log(this.checkDatesEmpty())

            this.checkDatesEmpty()
            this.checkDST()
            this.checkDatesLogical()

            console.log(rpdate.toISOString() + " - from date field ISO")
            console.log(this.checkDST(null, null, rpdate, null, null))
            // console.log(this.checkDatesLogical())
            // console.log(rpdate + " - after check")
            console.log(rpdate.toISOString() + " - after check ISO")


            rpdate.setHours(this.assignment.review_publish_time.substring(0, 2))

            // console.log(rpdate + " - after setting hours")
            console.log(rpdate.toISOString() + " - after setting hours ISO")

            rpdate.setMinutes(this.assignment.review_publish_time.substring(3, 5))

            // console.log(rpdate + " - after setting minutes")
            console.log(rpdate.toISOString() + " - after setting minutes ISO")

            console.log(parseInt(this.assignment.review_publish_time.substring(0,2))-1)
            console.log(parseInt(this.assignment.review_publish_time.substring(0,2))+1)
        },
        async onSubmit() {
            // Check for empty date and time fields
            let validationResult1 = this.checkDatesEmpty()
            if (validationResult1.error) {
                this.showErrorMessage({ message: validationResult1.error })
            } else {
                let pdate = this.assignment.publish_day
                let ddate = this.assignment.due_day
                let rpdate = this.assignment.review_publish_day
                let rddate = this.assignment.review_due_day
                let reddate = this.assignment.review_evaluation_due_day

                console.log("from date field: " + this.assignment.review_publish_day)
                console.log("from date field converted: " + rpdate)
                console.log("from date field ISO: " + rpdate.toISOString())

                console.log("Send JSON: " + rpdate.toJSON())
                console.log("Send ISO: " + rpdate.toISOString())



                // Check for daylight saving time issues
                let validationResult2 = this.checkDST(pdate, ddate, rpdate, rddate, reddate)
                if (validationResult2.title) {
                    this.showErrorMessage({
                        title: validationResult2.title,
                        message: "Due to switching to daylight saving time, you cannot choose a time between 02:00 and 02:59 on this date"
                    })
                } else {
                    console.log("after check " + rpdate)
                    console.log("after check ISO: " + rpdate.toISOString())
                    pdate.setHours(this.assignment.publish_time.substring(0, 2))
                    ddate.setHours(this.assignment.due_time.substring(0, 2))
                    rpdate.setHours(this.assignment.review_publish_time.substring(0, 2))
                    rddate.setHours(this.assignment.review_due_time.substring(0, 2))
                    reddate.setHours(this.assignment.review_evaluation_due_time.substring(0, 2))

                    console.log(typeof this.assignment.review_publish_time + this.assignment.review_publish_time)

                    pdate.setMinutes(this.assignment.publish_time.substring(3, 5))
                    ddate.setMinutes(this.assignment.due_time.substring(3, 5))
                    rpdate.setMinutes(this.assignment.review_publish_time.substring(3, 5))
                    rddate.setMinutes(this.assignment.review_due_time.substring(3, 5))
                    reddate.setMinutes(this.assignment.review_evaluation_due_time.substring(3, 5))

                    console.log("after setting minutes: " + rpdate)
                    console.log("after setting minutes ISO: " + rpdate.toISOString())

                    this.assignment.publish_date = pdate
                    this.assignment.due_date = ddate
                    this.assignment.review_publish_date = rpdate
                    this.assignment.review_due_date = rddate
                    this.assignment.review_evaluation_due_date = reddate

                    // Check order of dates
                    let validationResult3 = this.checkDatesLogical()
                    if (validationResult3.error) {
                        this.showErrorMessage({ message: validationResult3.error })
                    } else {
                        this.assignment.publish_date = pdate.toJSON()
                        this.assignment.due_date = ddate.toJSON()
                        this.assignment.review_publish_date = rpdate.toISOString()
                        this.assignment.review_due_date = rddate.toJSON()
                        this.assignment.review_evaluation_due_date = reddate.toJSON()

                        console.log("Send JSON: " + rpdate.toJSON())
                        console.log("Send ISO: " + rpdate.toISOString())

                        let formData = new FormData()
                        formData.append("title", this.assignment.title)
                        formData.append("description", this.assignment.description)
                        formData.append("course_id", this.assignment.course_id)

                        formData.append("publish_date", this.assignment.publish_date)
                        formData.append("due_date", this.assignment.due_date)
                        formData.append("review_publish_date", this.assignment.review_publish_date)
                        formData.append("review_due_date", this.assignment.review_due_date)

                        // Send review date only when selected
                        if (this.assignment.review_evaluation){
                            formData.append("review_evaluation_due_date", this.assignment.review_evaluation_due_date)
                        }
                        formData.append("reviews_per_user", this.assignment.reviews_per_user)
                        formData.append("review_evaluation", this.assignment.review_evaluation)
                        if (this.assignment.external_link != null && this.assignment.external_link != ''){
                            formData.append("external_link", this.assignment.external_link)
                        }

                        // Add file if a new one has been uploaded
                        if (this.file != null) {
                            formData.append("assignmentFile", this.file)
                        }
                        // Update assignment in database
                        try {
                            await api.saveAssignment(this.assignment.id, formData)
                            this.showSuccessMessage({ message: "Updated assignment successfully" })
                            // Redirect to updated assignment
                            this.$router.push({
                                name: 'teacher-dashboard.assignments.assignment',
                                params: { courseId: this.course.id, assignmentId: this.assignment.id }
                            })
                        } catch (e) {
                            this.showErrorMessage({ message: e.response.data.error })
                        }
                    }
                }
            }
        },
        checkDatesEmpty() {
            // Check whether all dates and time are nonempty
            if (this.assignment.publish_day === null) {
                return {error: "Publish date cannot be empty!"}
            } else if (this.assignment.due_day === null) {
                return {error: "Hand-in date cannot be empty!"}
            } else if (this.assignment.review_publish_day === null) {
                return {error: "Review start date cannot be empty!"}
            } else if (this.assignment.review_due_day === null) {
                return {error: "Review due date cannot be empty!"}
            } else if (this.assignment.review_evaluation && this.assignment.review_evaluation_due_day === null) {
                return {error: "Review evaluation due date cannot be empty!"}
            } else if (this.assignment.publish_time === "") {
                return {error: "Publish time cannot be empty!"}
            } else if (this.assignment.due_time === "") {
                return {error: "Hand-in time cannot be empty!"}
            } else if (this.assignment.review_publish_time === "") {
                return {error: "Review start time cannot be empty!"}
            } else if (this.assignment.review_due_time === "") {
                return {error: "Review due time cannot be empty!"}
            } else if (this.assignment.review_evaluation && this.assignment.review_evaluation_due_time === "") {
                return {error: "Review evaluation due time cannot be empty!"}
            } else {
                return true
            }
        },
        checkDST(pdate, ddate, rpdate, rddate, reddate) {
            // Instantiate new dates to avoid changing the passed value
            let pdate2 = new Date(pdate)
            let ddate2 = new Date(ddate)
            let rpdate2 = new Date(rpdate)
            let rddate2 = new Date(rddate)
            let reddate2 = new Date(reddate)
            // console.log("in check0: " + rpdate)
            // console.log("in check0: " + rpdate2)
            // console.log("ISO: " + rpdate2.toISOString())
            // rpdate2.setHours(this.assignment.review_publish_time.substring(0,2))
            // console.log(rpdate2)
            // console.log("ISO: " + rpdate2.toISOString())
            // rpdate2.setHours(this.assignment.review_publish_time.substring(0,2)-1)
            // console.log(rpdate2)
            // console.log("ISO: " + rpdate2.toISOString())
            if (pdate2.setHours(this.assignment.publish_time.substring(0,2)) === pdate2.setHours(parseInt(this.assignment.publish_time.substring(0,2))+1)) {
                // console.log("in check1: " + rpdate)
                return {title: "Error in publish time"}
            } else if (ddate2.setHours(this.assignment.due_time.substring(0,2)) === ddate2.setHours(parseInt(this.assignment.due_time.substring(0,2))+1)) {
                // console.log("in check2: " + rpdate)
                return {title: "Error in hand-in time"}
            } else if (rpdate2.setHours(this.assignment.review_publish_time.substring(0,2)) === rpdate2.setHours(parseInt(this.assignment.review_publish_time.substring(0,2))+1)) {
                // console.log("in check3: " + rpdate)
                return {title: "Error in review start time"}
            } else if (rddate2.setHours(this.assignment.review_due_time.substring(0,2)) === rddate2.setHours(parseInt(this.assignment.review_due_time.substring(0,2))+1)) {
                // console.log("in check4: " + rpdate)
                return {title: "Error in review due time"}
            } else if (this.assignment.review_evaluation &&
                reddate2.setHours(this.assignment.review_evaluation_due_time.substring(0,2)) === reddate2.setHours(parseInt(this.assignment.review_evaluation_due_time.substring(0,2))+1)) {
                // console.log("in check5: " + rpdate)
                return {title: "Error in review evaluation due time"}
            } else {
                // console.log("in check6: " + rpdate)
                // console.log("in check6: " + rpdate2)
                return true
            }
        },
        checkDatesLogical() {
            if (this.assignment.publish_date >= this.assignment.due_date ||
                this.assignment.publish_date >= this.assignment.review_publish_date ||
                this.assignment.publish_date >= this.assignment.review_due_date ||
                (this.assignment.review_evaluation && this.assignment.publish_date >= this.assignment.review_evaluation_due_date)) {
                return {error: 'Publish date should be before other dates!'}
            } else if (this.assignment.due_date >= this.assignment.review_publish_date ||
                this.assignment.due_date >= this.assignment.review_due_date ||
                (this.assignment.review_evaluation && this.assignment.due_date >= this.assignment.review_evaluation_due_date)) {
                return {error: 'Due date should be before review (evaluation) dates!'}
            } else if (this.assignment.review_publish_date >= this.assignment.review_due_date ||
                (this.assignment.review_evaluation && this.assignment.review_publish_date >= this.assignment.review_evaluation_due_date)) {
                return {error: 'Review start date should be before review (evaluation) due dates!'}
            } else if (this.assignment.review_evaluation && this.assignment.review_due_date >= this.assignment.review_evaluation_due_date) {
                return {error: 'Review due date should be before review evaluation date'}
            } else {
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
