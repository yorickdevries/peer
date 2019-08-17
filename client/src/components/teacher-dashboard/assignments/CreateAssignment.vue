<template>
    <div>
        <b-container>

            <!--Header-->
            <b-row>
                <b-col>
                    <h1 class="mt-5">Create a new assignment</h1>
                    <b-button @click="renderDate" variant="primary">Create the assignment</b-button>
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
                                        <datepicker placeholder="Select date" v-model="assignment.publish_day"></datepicker>
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
                                        <datepicker placeholder="Select date" v-model="assignment.due_day"></datepicker>
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
                                    {{assignment.review_publish_day}}
                                    <b-form-group>
                                        <template slot="label">Start date and time for peer review(s)
                                            <b-badge v-b-tooltip.hover title="The date and time on which the students can start peer reviewing" variant="primary">?</b-badge>
                                        </template>
                                        <datepicker placeholder="Select date" v-model="assignment.review_publish_day"></datepicker>
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
                                        <datepicker placeholder="Select date" v-model="assignment.review_due_day"></datepicker>
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

            console.log(this.assignment.publish_day)

            let pdate = new Date(this.assignment.publish_day.getDate() + " " + this.assignment.publish_time).toJSON();
            let ddate = new Date(this.assignment.due_day + " " + this.assignment.due_time).toJSON();
            let rpdate = new Date(this.assignment.review_publish_day + " " + this.assignment.review_publish_time).toJSON();
            let rddate = new Date(this.assignment.review_due_day + " " + this.assignment.review_due_time).toJSON();

            console.log("After New Date(): " + pdate)
            console.log("After New Date(): " + ddate)
            console.log("After New Date(): " + rpdate)
            console.log("After New Date(): " + rddate)

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
        },

        renderDate() {
            let validationResult1 = this.checkDatesEmpty()
            if (validationResult1.error) {
                this.showErrorMessage({message: validationResult1.error})
            } else {
                // this.showSuccessMessage({message: "Dates are all filled in!"})
                console.log("From datepicker: " + this.assignment.publish_day)
                console.log("From datepicker: " + this.assignment.due_day)
                console.log("From datepicker: " + this.assignment.review_publish_day)
                console.log("From datepicker: " + this.assignment.review_due_day)
                let pdate = this.assignment.publish_day
                let ddate = this.assignment.due_day
                let rpdate = this.assignment.review_publish_day
                let rddate = this.assignment.review_due_day

                let validationResult2 = this.checkDST(pdate, ddate, rpdate, rddate)
                if (validationResult2.title) {
                    this.showErrorMessage({title: validationResult2.title,
                        message: "Due to switching to daylight saving time, you cannot choose a time between 03:00 and 03:59 on this date"})
                } else {
                    this.showSuccessMessage({message: "No DST error"})
                    pdate.setHours(this.assignment.publish_time.substring(0,2))
                    ddate.setHours(this.assignment.due_time.substring(0,2))
                    rpdate.setHours(this.assignment.review_publish_time.substring(0,2))
                    rddate.setHours(this.assignment.review_due_time.substring(0,2))

                    pdate.setMinutes(this.assignment.publish_time.substring(3,5))
                    ddate.setMinutes(this.assignment.due_time.substring(3,5))
                    rpdate.setMinutes(this.assignment.review_publish_time.substring(3,5))
                    rddate.setMinutes(this.assignment.review_due_time.substring(3,5))

                    console.log("After setting time: " + pdate)
                    console.log("After setting time: " + ddate)
                    console.log("After setting time: " + rpdate)
                    console.log("After setting time: " + rddate)

                    // let validationResult3 = this.checkDatesLogical()
                    // if (validationResult3.error) {
                    //     this.showErrorMessage({message: validationResult3.error})
                    // } else {
                    //     this.showSuccessMessage({message: "Dates are all correct!"})
                    //     this.assignment.publish_date = pdate.toJSON()
                    //     // console.log("After toJSON(): " + this.assignment.publish_date)
                    // }
                }
            }




            // console.log(this.assignment.publish_time)

            // let pdate = new Date(this.assignment.publish_day.getDate() + " " + this.assignment.publish_time).toJSON();
            // let pdate = this.assignment.publish_day
            // pdate.setHours(this.assignment.publish_time.substring(0,2))
            // pdate.setMinutes(this.assignment.publish_time.substring(3,5))
            // this.assignment.publish_date = pdate.toJSON();
            // let ddate = new Date(this.assignment.due_day + " " + this.assignment.due_time).toJSON();
            // let rpdate = new Date(this.assignment.review_publish_day + " " + this.assignment.review_publish_time).toJSON();
            // let rddate = new Date(this.assignment.review_due_day + " " + this.assignment.review_due_time).toJSON();
            //
            // console.log("After New Date(): " + pdate)
            // console.log(this.assignment.publish_date)
            // console.log("After New Date(): " + ddate)
            // console.log("After New Date(): " + rpdate)
            // console.log("After New Date(): " + rddate)
        },
        checkDatesEmpty() {
            // Check whether all dates are nonempty
            if (this.assignment.publish_day === null) {
                return {error: "Publish date cannot be empty!"}
            } else if (this.assignment.due_day === null) {
                return {error: "Hand-in date cannot be empty!"}
            } else if (this.assignment.review_publish_day === null) {
                return {error: "Review publish date cannot be empty!"}
            } else if (this.assignment.review_due_day === null) {
                return {error: "Review due date cannot be empty!"}
            } else {
                return true
            }
        },
        checkDST(pdate, ddate, rpdate, rddate) {
            console.log(pdate)
            console.log(ddate)
            console.log(rpdate)
            console.log(rpdate)
            console.log(pdate.setHours(this.assignment.publish_time.substring(0,2)))
            console.log(pdate.setHours(this.assignment.publish_time.substring(0,2)-1))
            if (pdate.setHours(this.assignment.publish_time.substring(0,2)) === pdate.setHours(this.assignment.publish_time.substring(0,2)-1)) {
                return {title: "Error in publish time"}
            } else if (ddate.setHours(this.assignment.due_time.substring(0,2)) === ddate.setHours(this.assignment.due_time.substring(0,2)-1)) {
                return {title: "Error in hand-in time"}
            } else if (rpdate.setHours(this.assignment.review_publish_time.substring(0,2)) === rpdate.setHours(this.assignment.review_publish_time.substring(0,2)-1)) {
                return {title: "Error in review publish time"}
            } else if (rddate.setHours(this.assignment.review_due_time.substring(0,2)) === rddate.setHours(this.assignment.review_due_time.substring(0,2)-1)) {
                return {title: "Error in review due time"}
            } else {
                return true
            }
        },
        checkDatesLogical() {
            // Check whether dates are logical
            if (this.assignment.publish_date > this.assignment.due_date || this.assignment.publish_date > this.assignment.review_publish_date || this.assignment.publish_date > this.assignment.review_due_date) {
                return {error: 'Publish date is later than other dates!'}
            } else if (this.assignment.due_date > this.assignment.review_publish_date || this.assignment.due_date > this.assignment.review_due_date) {
                return {error: 'Due date is later than review dates!'}
            } else if (this.assignment.review_publish_date > this.assignment.review_due_date) {
                return {error: 'Review start date is later than review due dates!'}
            } else {
                return true
            }
        }
        // renderDate() {
        //     // console.log(this.assignment.publish_time)
        //
        //     // let pdate = new Date(this.assignment.publish_day.getDate() + " " + this.assignment.publish_time).toJSON();
        //     let pdate = this.assignment.publish_day
        //     // console.log(this.assignment.publish_time.substring(0,2))
        //     console.log(this.assignment.publish_time.substring(3,5))
        //     pdate.setHours(this.assignment.publish_time.substring(0,2))
        //     pdate.setMinutes(this.assignment.publish_time.substring(3,5))
        //     this.assignment.publish_date = pdate.toJSON();
        //     let ddate = new Date(this.assignment.due_day + " " + this.assignment.due_time).toJSON();
        //     let rpdate = new Date(this.assignment.review_publish_day + " " + this.assignment.review_publish_time).toJSON();
        //     let rddate = new Date(this.assignment.review_due_day + " " + this.assignment.review_due_time).toJSON();
        //
        //     console.log("After New Date(): " + pdate)
        //     console.log(this.assignment.publish_date)
        //     // console.log("After New Date(): " + ddate)
        //     // console.log("After New Date(): " + rpdate)
        //     // console.log("After New Date(): " + rddate)
        // }
    }
}
</script>

<style>
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