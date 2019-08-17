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

                            <!--Publish and due date of the assignment-->
                            <b-row class="mb-3">
                                <b-col>
                                    <b-form-group>
                                        <template slot="label"><b-badge variant="info">1</b-badge> Publish date and time</template>
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
                                </b-col>
                                <b-col>
                                    <b-form-group>
                                        <template slot="label"><b-badge variant="info">2</b-badge> Hand-in due date and time</template>
                                        <b-form-input   v-model="assignment.due_day"
                                                        type="date"
                                                        placeholder="Please enter date on which the assignment should be handed in"
                                                        required>
                                        </b-form-input>
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
                                        <template slot="label"><b-badge variant="info">3</b-badge> Start date and time for peer review</template>
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
                                </b-col>
                                <b-col>
                                    <b-form-group>
                                        <template slot="label"><b-badge variant="info">4</b-badge> Due date and time for peer review</template>
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
                                </b-col>
                            </b-row>
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

                            <b-form-group   label="Review on Review"
                                            description="This can not be changed after creating the assignment.">
                                    <b-form-checkbox
                                            v-model="assignment.review_evaluation"
                                            disabled
                                    >
                                       Enable Review on review (makes students review each other reviews).
                                    </b-form-checkbox>
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
  import notifications from "../../../mixins/notifications";

  export default {
    mixins: [notifications],
    data() {
      return {
        file: null,
        fileProgress: 0,
        uploadNewFile: false,
        acceptFiles: ".pdf,.zip",
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
          filename: null,
          one_person_groups: null,
          review_evaluation: null
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

      // Define functions for correct formatting of date and time
      function dateToInputFormat(date) {
        let str = "";
        // console.log(str)
        str = str + date.getFullYear().toString() + "-"
        // console.log(str)
        str = (date.getMonth()+1) < 10 ? str + "0" + (date.getMonth() + 1).toString() + "-" : str + (date.getMonth()+1).toString() + "-"
        // console.log(str)
        str = date.getDate() < 10 ? str + "0" + date.getDate().toString() : str + date.getDate().toString()
        // console.log(str)
        return str
      }

      function timeToInputFormat(time) {
        let str = "";
        str = time.getHours() < 10 ? str + "0" + time.getHours().toString() + ":" : str + time.getHours().toString() + ":"
        str = time.getMinutes() < 10 ? str + "0" + time.getMinutes().toString() : str + time.getMinutes().toString()
          console.log("time " + time)
          console.log("str " + str)
        return str
      }

      // Set publish date and time
      let pdate = new Date(res.data.publish_date)
      this.assignment.publish_day = dateToInputFormat(pdate)
      this.assignment.publish_time = timeToInputFormat(pdate)

      // Set due date and time
      let ddate = new Date(res.data.due_date)
      this.assignment.due_day = dateToInputFormat(ddate)
      this.assignment.due_time = timeToInputFormat(ddate)

      // Set due date and time
      let rpdate = new Date(res.data.review_publish_date)
      this.assignment.review_publish_day = dateToInputFormat(rpdate)
      this.assignment.review_publish_time = timeToInputFormat(rpdate)

      // Set due date and time
      let rddate = new Date(res.data.review_due_date)
      this.assignment.review_due_day = dateToInputFormat(rddate)
      this.assignment.review_due_time = timeToInputFormat(rddate)
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
        // Compose datetime format from date and time
        this.assignment.publish_date = new Date(this.assignment.publish_day + " " + this.assignment.publish_time).toJSON();
        this.assignment.due_date = new Date(this.assignment.due_day + " " + this.assignment.due_time).toJSON();
        this.assignment.review_publish_date = new Date(this.assignment.review_publish_day + " " + this.assignment.review_publish_time).toJSON();
        this.assignment.review_due_date = new Date(this.assignment.review_due_day + " " + this.assignment.review_due_time).toJSON();

        let validationResult = this.checkDates()
        if (validationResult.error) {
          this.showErrorMessage({message: validationResult.error})
        } else {
          // Compose formdata object to send information to back-end
          let formData = new FormData()
          formData.append("title", this.assignment.title)
          formData.append("description", this.assignment.description)
          formData.append("course_id", this.assignment.course_id)
          formData.append("publish_date", this.assignment.publish_date)
          formData.append("due_date", this.assignment.due_date)
          formData.append("review_publish_date", this.assignment.review_publish_date)
          formData.append("review_due_date", this.assignment.review_due_date)
          formData.append("reviews_per_user", this.assignment.reviews_per_user)
          formData.append("review_evaluation", this.assignment.review_evaluation)

          // Add file if a new one has been uploaded
          if (this.file != null) {
            formData.append("assignmentFile", this.file)
          }
          // Update assignment in database
          try{
            await api.saveAssignment(this.assignment.id, formData)
            this.showSuccessMessage({message: "Updated assignment successfully"})
            // Redirect to updated assignment
            this.$router.push({name: 'teacher-dashboard.assignments.assignment', params: {courseId: this.course.id, assignmentId: this.assignment.id} })
          } catch (e) {
            this.showErrorMessage()
          }
        }

      }
    }

  }
</script>