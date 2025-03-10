<template>
    <div>
        <b-row>
            <b-col cols="4">
                <AssignmentDetails :assignment="assignment"></AssignmentDetails>
            </b-col>
            <b-col cols="8">
                <b-card header="Actions">
                    This is the state overview of the assignment. You should manually trigger the next stage when
                    automatic state progression isn't turned on.
                    <dl class="mb-0">
                        <FormWizard
                            title="Assignment state progression"
                            :subtitle="'Current state: ' + assignment.state"
                            color="#00A6D6"
                            :startIndex="currentStateIndex"
                        >
                            <!--Remove clickabillity of steps-->
                            <template slot="step" slot-scope="props">
                                <WizardStep
                                    :tab="props.tab"
                                    :transition="props.transition"
                                    :index="props.index"
                                ></WizardStep>
                            </template>
                            <TabContent
                                v-for="(assignmentState, index) in assignmentStates"
                                :key="index"
                                :title="assignmentState.name"
                                :icon="assignmentState.icon"
                            >
                            </TabContent>
                            <!--Trick to remove the Next button-->
                            <div slot="footer"></div>
                        </FormWizard>

                        <!--Publish assignment-->
                        <div v-if="assignment.state === 'unpublished'">
                            <dt>Publish assignment</dt>
                            <dd>Publish the assignment so students are able to make submissions</dd>
                            <b-button
                                v-b-modal="`publishAssignment${assignment.id}`"
                                :disabled="disableButton"
                                class="mb-3"
                                variant="primary"
                                size="sm"
                                >Publish
                            </b-button>
                            <b-alert v-if="assignment.automaticStateProgression" show warning
                                >Automatic state progression is enabled. Make sure you have created at least one
                                assignment version before the publish date.</b-alert
                            >
                            <b-modal
                                :id="`publishAssignment${assignment.id}`"
                                @ok="publishAssignment"
                                title="Confirmation"
                                centered
                            >
                                Are you sure you want to publish the assignment?
                                <ul>
                                    <li>After publication no additional assignment versions can be created</li>
                                    <li>After publication the allowed submission file extensions cannot be changed.</li>
                                </ul>
                            </b-modal>
                        </div>

                        <!--Close submission stage-->
                        <div v-if="assignment.state === 'submission'">
                            <dt>Close submission state</dt>
                            <dd>Close the assignment for receiving submissions</dd>
                            <b-button
                                v-b-modal="`closeSubmission${assignment.id}`"
                                :disabled="disableButton"
                                class="mb-3 mr-2"
                                variant="primary"
                                size="sm"
                                >Close submission
                            </b-button>
                            <b-alert v-if="assignment.automaticStateProgression" show warning
                                >Automatic state progression is enabled. Make sure your students have made submissions
                                before the deadline.</b-alert
                            >
                            <b-modal
                                :id="`closeSubmission${assignment.id}`"
                                @ok="closeSubmission"
                                title="Confirmation"
                                centered
                            >
                                Are you sure you want to close the submission state?
                                <ul>
                                    <li>After this no new submissions can be made by students anymore.</li>
                                    <li>After this the groups cannot be changed anymore</li>
                                </ul>
                            </b-modal>
                            <b-button
                                v-b-modal="`revertStateSubmission${assignment.id}`"
                                :disabled="disableButton"
                                class="mb-3"
                                variant="primary"
                                size="sm"
                                >Revert to previous stage
                            </b-button>
                            <b-modal
                                :ok-disabled="isMessageAssignmentName"
                                :id="`revertStateSubmission${assignment.id}`"
                                @ok="revertState"
                                title="Confirmation"
                                centered
                            >
                                <div class="mb-3">Please enter the assignment name to confirm.</div>
                                <div class="mb-3"><input v-model="message" /></div>
                                <b-alert show variant="danger">
                                    Are you sure you want to revert state to "Unpublished"? This will delete all
                                    submissions
                                </b-alert>
                            </b-modal>
                        </div>

                        <!--Distribute Reviews-->
                        <div v-if="assignment.state === 'waitingforreview'">
                            <dt>Distribute Reviews</dt>
                            <dd>This action will distribute reviews to users of groups which made a submission.</dd>
                            <b-alert v-if="assignment.automaticStateProgression" show warning
                                >Automatic state progression is enabled. Make sure you finalised your
                                submissionquestionnaires before the review publish date. In addition, make sure your
                                review distribution is set correctly in the assignmentversions tab.</b-alert
                            >
                            <b-alert v-if="showDistributeAlert" show
                                >Reviews are being distributed, check back in a few minutes to see the results</b-alert
                            >
                            <b-button
                                v-b-modal="`distributeReviews${assignment.id}`"
                                :disabled="disableButton"
                                class="mb-3 mr-2"
                                variant="primary"
                                size="sm"
                                >Distribute Reviews
                            </b-button>
                            <b-modal
                                :id="`distributeReviews${assignment.id}`"
                                @ok="distributeReviews"
                                title="Confirmation"
                                centered
                            >
                                Are you sure you want to distribute the reviews?
                                <ul>
                                    <li>
                                        The submissions which take part in the reviews are definite after this action.
                                    </li>
                                    <li>The submissionquestionnaire cannot be changed after this action.</li>
                                    <li>Only press this button <b>once</b> per assignment.</li>
                                    <li>
                                        If you pressed this button earlier, it can be that reviews are still being
                                        assigned.
                                    </li>
                                </ul>
                            </b-modal>
                            <b-button
                                v-b-modal="`revertStateWaiting${assignment.id}`"
                                :disabled="disableButton"
                                class="mb-3"
                                variant="primary"
                                size="sm"
                                >Revert to previous stage
                            </b-button>
                            <b-modal
                                :ok-disabled="isMessageAssignmentName"
                                :id="`revertStateWaiting${assignment.id}`"
                                @ok="revertState"
                                title="Confirmation"
                                centered
                            >
                                <div class="mb-3">Please enter the assignment name to confirm.</div>
                                <div class="mb-3"><input v-model="message" /></div>
                                <b-alert show variant="danger">
                                    Are you sure you want to revert state to "Submission"?
                                </b-alert>
                            </b-modal>
                        </div>

                        <!--Open feedback-->
                        <div v-if="assignment.state === 'review'">
                            <dt>Open Feedback</dt>
                            <dd>This action will open the the feedback for the reviewed students</dd>
                            <b-alert v-if="assignment.automaticStateProgression" show warning
                                >Automatic state progression is enabled. In case you have set up review evaluation, make
                                sure you finalised your reviewquestionnaires before the review due date.</b-alert
                            >
                            <b-alert v-if="showOpenFeedbackAlert" show
                                >All flagged and completely filled in reviews are being submitted and feedback will be
                                opened therafter, check back in a few minutes to see the results</b-alert
                            >
                            <b-button
                                v-b-modal="`openFeedback${assignment.id}`"
                                :disabled="disableButton"
                                class="mb-3 mr-2"
                                variant="primary"
                                size="sm"
                                >Open Feedback
                            </b-button>
                            <b-modal
                                :id="`openFeedback${assignment.id}`"
                                @ok="openFeedback"
                                title="Confirmation"
                                centered
                            >
                                Are you sure you want to open the feedback?
                                <ul>
                                    <li>All submitted reviews cannot be changed anymore</li>
                                    <li>
                                        All reviews which are fully filled in (all non-optional questions are answered)
                                        or flagged as not serious will be submitted as well
                                    </li>
                                    <li>
                                        All reviews which are not submitted yet can still be completed when late
                                        submission reviews are allowed
                                    </li>
                                    <li>
                                        If review evaluation is enabled, students can evaluate their reviews till the
                                        deadline you specified
                                    </li>
                                    <li>The reviewquestionnaire cannot be changed after this action.</li>
                                </ul>
                            </b-modal>
                            <b-button
                                v-b-modal="`revertStateReview${assignment.id}`"
                                :disabled="disableButton"
                                class="mb-3"
                                variant="primary"
                                size="sm"
                                >Revert to previous stage
                            </b-button>
                            <b-modal
                                :ok-disabled="isMessageAssignmentName"
                                :id="`revertStateReview${assignment.id}`"
                                @ok="revertState"
                                title="Confirmation"
                                centered
                            >
                                <div class="mb-3">Please enter the assignment name to confirm.</div>
                                <div class="mb-3"><input v-model="message" /></div>
                                <b-alert show variant="danger">
                                    Are you sure you want to revert state to "Waiting for review"? This will delete all
                                    reviews
                                </b-alert>
                            </b-modal>
                        </div>
                        <!--Revert feedback-->
                        <div v-if="assignment.state === 'feedback'">
                            <b-button
                                v-b-modal="`revertFeedback${assignment.id}`"
                                :disabled="disableButton"
                                class="mb-3 mr-2"
                                variant="primary"
                                size="sm"
                                >Revert to previous stage
                            </b-button>
                            <b-modal
                                :ok-disabled="isMessageAssignmentName"
                                :id="`revertFeedback${assignment.id}`"
                                @ok="revertState"
                                title="Confirmation"
                                centered
                            >
                                <div class="mb-3">Please enter the assignment name to confirm.</div>
                                <div class="mb-3"><input v-model="message" /></div>
                                <b-alert show variant="danger">
                                    Are you sure you want to revert state to "Review"? This will delete all evaluations.
                                </b-alert>
                            </b-modal>
                        </div>
                    </dl>
                </b-card>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import api from "../../../api/api"
import _ from "lodash"
import AssignmentDetails from "../../ta_teacher_shared/AssignmentDetails"
import notifications from "../../../mixins/notifications"
import { FormWizard, WizardStep, TabContent } from "vue-form-wizard"
import "vue-form-wizard/dist/vue-form-wizard.min.css"

export default {
    mixins: [notifications],
    components: {
        FormWizard,
        WizardStep,
        TabContent,
        AssignmentDetails,
    },
    data() {
        return {
            message: "",
            assignment: null,
            assignmentStates: [
                { name: "unpublished", icon: "fas fa-eye-slash" },
                { name: "submission", icon: "fas fa-file-pdf" },
                { name: "waitingforreview", icon: "fas fa-user-clock" },
                { name: "review", icon: "fas fa-glasses" },
                { name: "feedback", icon: "fas fa-comments" },
            ],
            disableButton: false,
            showDistributeAlert: false,
            showOpenFeedbackAlert: false,
        }
    },
    computed: {
        isMessageAssignmentName() {
            return this.message !== this.assignment.name
        },
        currentStateIndex() {
            if (!this.assignment) {
                return -1
            }
            return _.findIndex(this.assignmentStates, (o) => {
                return o.name === this.assignment.state
            })
        },
    },
    async created() {
        await this.fetchAssignment()
    },
    methods: {
        async fetchAssignment() {
            this.assignment = null
            let res = await api.assignments.get(this.$route.params.assignmentId)
            this.assignment = res.data
        },
        async publishAssignment() {
            this.disableButton = true
            await api.assignments.publish(this.$route.params.assignmentId)
            this.showSuccessMessage({ message: "Assignment succesfully published" })
            this.disableButton = false
            await this.fetchAssignment()
            this.$router.go()
        },
        async closeSubmission() {
            this.disableButton = true
            await api.assignments.closeSubmission(this.$route.params.assignmentId)
            this.showSuccessMessage({ message: "Assignment succesfully closed" })
            this.disableButton = false
            await this.fetchAssignment()
            this.$router.go()
        },
        async distributeReviews() {
            this.disableButton = true
            await api.reviewofsubmissions.distribute(this.$route.params.assignmentId)
            this.showSuccessMessage()
            this.showDistributeAlert = true
            this.$router.go()
        },
        async openFeedback() {
            this.disableButton = true
            await api.reviewofsubmissions.openFeedback(this.$route.params.assignmentId)
            this.showSuccessMessage()
            this.showOpenFeedbackAlert = true
            this.$router.go()
        },
        async revertState() {
            this.disableButton = true
            await api.assignments.revertState(this.$route.params.assignmentId)
            this.showSuccessMessage({ message: "State reverted" })
            this.disableButton = false
            await this.fetchAssignment()
            this.$router.go()
        },
    },
}
</script>
