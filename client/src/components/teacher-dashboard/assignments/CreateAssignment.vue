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
                            <b-alert v-model="$browserDetect.isSafari" variant="warning">
                                If you are using Safari, make sure you enter 4 digits for the time input.
                                Not doing so may result in not being able to create the assignment.
                            </b-alert>
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
                                </b-col>
                                <b-col>
                                    <b-form-group>
                                        <template slot="label">Due date and time for peer review(s)
                                            <b-badge v-b-tooltip.hover title="The date and time before which the students have to submit their review(s)" variant="primary">?</b-badge>
                                        </template>
                                        <datepicker placeholder="Select date" v-model="assignment.review_due_day"></datepicker>
                                        <b-form-input   v-model="assignment.review_due_time"
                                                        type="time"
                                                        placeholder="Please enter due time of the peer review"
                                                        required>
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
                            <b-form-group label="Assignment file" description="Add a file for the assignment (optional).">
                                <b-form-file
                                        placeholder="Choose a file..."
                                        accept=".pdf,.zip"
                                        v-model="file"
                                        :state="Boolean(file)"
                                        v-if="uploadSuccess === null">
                                </b-form-file>
                            </b-form-group>

                            <!--File link-->
                            <b-form-group label="Assignment link" description="Add a link where the assignment can be found for the student (optional).">
                                <b-form-input v-model="assignment.external_link"></b-form-input>
                            </b-form-group>

                            <b-form-group label="Assignment Type" description="This can not be changed after creating the assignment.">
                                <b-form-radio-group v-model="assignment.one_person_groups"
                                                    :options="[
                                                        { value: true, text: 'Individual'},
                                                        { value: false, text: 'Group'}
                                                    ]"
                                                    stacked
                                                    name="radiosStacked">
                                </b-form-radio-group>
                            </b-form-group>

                            <b-row>
                                <b-col>
                                    <b-form-group label="Students can evaluate their received reviews"
                                                  description="This can not be changed after creating the assignment.">
                                        <b-form-checkbox
                                                v-model="assignment.review_evaluation">
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
                review_evaluation_due_day: null,
                review_evaluation_due_time: "23:59",
                review_evaluation_due_date: null,
                reviews_per_user: null,
                one_person_groups: false,
                review_evaluation: false,
                external_link: null
            }
        }
    },
    computed: {
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
            // Check for empty date and time fields
            let validationResult1 = this.checkDatesEmpty()
            if (validationResult1.error) {
                this.showErrorMessage({message: validationResult1.error})
            } else {
                // Load date from fields in variables of type Date
                // Note that these are only the dates, not the times, as these are in different input fields
                let pdate = this.assignment.publish_day
                let ddate = this.assignment.due_day
                let rpdate = this.assignment.review_publish_day
                let rddate = this.assignment.review_due_day
                let reddate = this.assignment.review_evaluation_due_day

                // Check for daylight saving time issues
                let validationResult2 = this.checkDST(pdate, ddate, rpdate, rddate, reddate)
                if (validationResult2.title) {
                    this.showErrorMessage({title: validationResult2.title,
                        message: "Due to switching to daylight saving time, you cannot choose a time between 02:00 and 02:59 on this date"})
                } else {
                    // Get the hours from the input field and set in variable
                    pdate.setHours(this.assignment.publish_time.substring(0,2))
                    ddate.setHours(this.assignment.due_time.substring(0,2))
                    rpdate.setHours(this.assignment.review_publish_time.substring(0,2))
                    rddate.setHours(this.assignment.review_due_time.substring(0,2))
                    if (reddate != null) {
                        reddate.setHours(this.assignment.review_evaluation_due_time.substring(0,2))
                    }

                    // Get the minutes from the input field and set in variable
                    pdate.setMinutes(this.assignment.publish_time.substring(3,5))
                    ddate.setMinutes(this.assignment.due_time.substring(3,5))
                    rpdate.setMinutes(this.assignment.review_publish_time.substring(3,5))
                    rddate.setMinutes(this.assignment.review_due_time.substring(3,5))
                    if (reddate != null) {
                        reddate.setMinutes(this.assignment.review_evaluation_due_time.substring(3,5))
                    }

                    // Set the date fields of the assignment. These are now Date objects
                    // These values are the day and time of the deadline
                    this.assignment.publish_date = pdate
                    this.assignment.due_date = ddate
                    this.assignment.review_publish_date = rpdate
                    this.assignment.review_due_date = rddate
                    this.assignment.review_evaluation_due_date = reddate

                    // Check order of dates
                    let validationResult3 = this.checkDatesLogical()
                    if (validationResult3.error) {
                        this.showErrorMessage({message: validationResult3.error})
                    } else {
                        // Convert the Date objects to JSON for formdata
                        this.assignment.publish_date = pdate.toJSON()
                        this.assignment.due_date = ddate.toJSON()
                        this.assignment.review_publish_date = rpdate.toJSON()
                        this.assignment.review_due_date = rddate.toJSON()
                        if (reddate != null) {
                            this.assignment.review_evaluation_due_date = reddate.toJSON()
                        }

                        // Create formData and append data
                        let formData = new FormData()
                        formData.append("title", this.assignment.title)
                        formData.append("description", this.assignment.description)
                        formData.append("course_id", this.assignment.course_id)

                        formData.append("publish_date", this.assignment.publish_date)
                        formData.append("due_date",  this.assignment.due_date)
                        formData.append("review_publish_date", this.assignment.review_publish_date)
                        formData.append("review_due_date", this.assignment.review_due_date)

                        // Send review date only when selected
                        if (this.assignment.review_evaluation){
                            formData.append("review_evaluation_due_date", this.assignment.review_evaluation_due_date)
                        }

                        formData.append("assignmentFile", this.file)
                        formData.append("reviews_per_user", this.assignment.reviews_per_user)
                        formData.append("one_person_groups", this.assignment.one_person_groups)
                        formData.append("review_evaluation", this.assignment.review_evaluation)
                        if (this.assignment.external_link != null && this.assignment.external_link != ''){
                            formData.append("external_link", this.assignment.external_link)
                        }

                        try {
                            // Send formData to backend
                            await api.createAssignment(formData)
                            this.showSuccessMessage({message: "Assignment was successfully created"})
                            this.$router.push({name: 'teacher-dashboard.assignments', params: {courseId: this.assignment.course_id}})
                        } catch (e) {
                            this.showErrorMessage({message: e.response.data.error})
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

            // Checking whether Daylight Saving Time is starting on the given day (changing from GMT+1 to GMT+2)
            // This causes deadlines set between 02:00 and 02:59 to be equal to 03:00-03:59 when converting to UTC
            // As a result, a deadline set at 02:00, will actually be set at 03:00
            // For some reason, Safari handles Daylight Saving Time differently. We should have a look if MomentJS can help with this issue
            if (pdate2.setHours(this.assignment.publish_time.substring(0,2)) === pdate2.setHours(parseInt(this.assignment.publish_time.substring(0,2))+1)) {
                return {title: "Error in publish time"}
            } else if (ddate2.setHours(this.assignment.due_time.substring(0,2)) === ddate2.setHours(parseInt(this.assignment.due_time.substring(0,2))+1)) {
                return {title: "Error in hand-in time"}
            } else if (rpdate2.setHours(this.assignment.review_publish_time.substring(0,2)) === rpdate2.setHours(parseInt(this.assignment.review_publish_time.substring(0,2))+1)) {
                return {title: "Error in review start time"}
            } else if (rddate2.setHours(this.assignment.review_due_time.substring(0,2)) === rddate2.setHours(parseInt(this.assignment.review_due_time.substring(0,2))+1)) {
                return {title: "Error in review due time"}
            } else if (this.assignment.review_evaluation &&
                reddate2.setHours(this.assignment.review_evaluation_due_time.substring(0,2)) === reddate2.setHours(parseInt(this.assignment.review_evaluation_due_time.substring(0,2))+1)) {
                return {title: "Error in review evaluation due time"}
            } else {
                return true
            }
        },
        checkDatesLogical() {
            // Checks whether deadlines have been entered in chronological order
            // Check publish date
            if (this.assignment.publish_date >= this.assignment.due_date ||
                this.assignment.publish_date >= this.assignment.review_publish_date ||
                this.assignment.publish_date >= this.assignment.review_due_date ||
                (this.assignment.review_evaluation && this.assignment.publish_date >= this.assignment.review_evaluation_due_date)) {
                return {error: 'Publish date should be before other dates!'}
            }
            // Check due date
            else if (this.assignment.due_date >= this.assignment.review_publish_date ||
                this.assignment.due_date >= this.assignment.review_due_date) {
                return {error: 'Due date should be before review dates!'}
            }
            // Show different warning in case of error with review evaluation date
            else if (this.assignment.review_evaluation && this.assignment.due_date >= this.assignment.review_evaluation_due_date) {
                return {error: 'Due date should be before review evaluation date!'}
            }
            // Check review publish date
            else if (this.assignment.review_publish_date >= this.assignment.review_due_date) {
                return {error: 'Review start date should be before review due date!'}
            }
            // Show different warning in case of error with review evaluation date
            else if (this.assignment.review_evaluation && this.assignment.review_publish_date >= this.assignment.review_evaluation_due_date) {
                return {error: 'Review start date should be before review evaluation due date!'}
            }
            // Check review evaluation date
            else if (this.assignment.review_evaluation && this.assignment.review_due_date >= this.assignment.review_evaluation_due_date) {
                return {error: 'Review due date should be before review evaluation date'}
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