<template>
    <div>
        <b-container v-if="!assignment">
            <div>Loading Assignment</div>
        </b-container>

        <b-container v-else>
            <!--Header and action-->
            <BreadcrumbTitle :items="['Assignments', assignment.name]" class="mt-3">
                <b-button
                    variant="success"
                    :to="{
                        name: 'teacher-dashboard.assignments.assignment.edit',
                        params: { courseId: this.$route.params.courseId, assignmentId: assignment.id }
                    }"
                >
                    Edit assignment
                </b-button>
            </BreadcrumbTitle>

            <b-card no-body>
                <b-tabs card>
                    <!--Details & Action-->
                    <b-tab title="Home" active>
                        <b-row>
                            <b-col cols="4">
                                <AssignmentDetails :assignment="assignment"></AssignmentDetails>
                            </b-col>
                            <b-col cols="8">
                                <b-card header="Actions">
                                    This is the state overview of the assignment. You should manually trigger the next
                                    stage when needed.
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
                                                v-b-modal="'publishAssignment'"
                                                class="mb-3"
                                                variant="primary"
                                                size="sm"
                                                >Publish
                                            </b-button>
                                            <b-modal
                                                id="publishAssignment"
                                                @ok="publishAssignment"
                                                title="Confirmation"
                                                centered
                                            >
                                                Are you sure you want to publish the assignment?
                                                <ul>
                                                    <li>
                                                        After publication the allowed submission extensions cannot be
                                                        changed.
                                                    </li>
                                                </ul>
                                            </b-modal>
                                        </div>

                                        <!--Close submission stage-->
                                        <div v-if="assignment.state === 'submission'">
                                            <dt>Close submission state</dt>
                                            <dd>Close the assignment for receiving submissions</dd>
                                            <b-button
                                                v-b-modal="'closeSubmission'"
                                                class="mb-3"
                                                variant="primary"
                                                size="sm"
                                                >Close submission
                                            </b-button>
                                            <b-modal
                                                id="closeSubmission"
                                                @ok="closeSubmission"
                                                title="Confirmation"
                                                centered
                                            >
                                                Are you sure you want to close the submission state?
                                                <ul>
                                                    <li>
                                                        After this no new submissions can be made by students anymore.
                                                    </li>
                                                    <li>
                                                        After this the groups cannot be changed anymore
                                                    </li>
                                                </ul>
                                            </b-modal>
                                        </div>

                                        <!--Distribute Reviews-->
                                        <div v-if="assignment.state === 'waitingforreview'">
                                            <dt>Distribute Reviews</dt>
                                            <dd>
                                                This action will distribute reviews to users of groups which made a
                                                submission.
                                            </dd>
                                            <b-button
                                                v-b-modal="'distributeReviews'"
                                                class="mb-3"
                                                variant="primary"
                                                size="sm"
                                                >Distribute Reviews
                                            </b-button>
                                            <b-modal
                                                id="distributeReviews"
                                                @ok="distributeReviews"
                                                title="Confirmation"
                                                centered
                                            >
                                                Are you sure you want to distribute the reviews?
                                                <ul>
                                                    <li>Can (and should be) done only once per assignment.</li>
                                                    <li>
                                                        The submissionquestionnaire cannot be changed after this action.
                                                    </li>
                                                </ul>
                                            </b-modal>
                                        </div>

                                        <!--Open feedback-->
                                        <div v-if="assignment.state === 'review'">
                                            <dt>Open Feedback</dt>
                                            <dd>
                                                This action will open the the feedback for the reviewed students
                                            </dd>
                                            <b-button
                                                v-b-modal="'openFeedback'"
                                                class="mb-3"
                                                variant="primary"
                                                size="sm"
                                                >Open Feedback
                                            </b-button>
                                            <b-modal id="openFeedback" @ok="openFeedback" title="Confirmation" centered>
                                                Are you sure you want to open the feedback?
                                                <ul>
                                                    <li>All submitted reviews cannot be changed anymore</li>
                                                    <li>
                                                        All reviews which are fully filled in (all non-optional
                                                        questions are answered) will be submitted as well
                                                    </li>
                                                    <li>
                                                        All reviews which are not submitted yet can still be completed
                                                    </li>
                                                    <li>
                                                        If review evaluation is enabled, students can evaluate their
                                                        reviews till the deadline you specified
                                                    </li>
                                                    <li>
                                                        The reviewquestionnaire cannot be changed after this action.
                                                    </li>
                                                </ul>
                                            </b-modal>
                                        </div>
                                    </dl>
                                </b-card>
                            </b-col>
                        </b-row>
                    </b-tab>

                    <!--Groups-->
                    <b-tab title="Groups">
                        <Groups :assignmentId="assignment.id"></Groups>
                    </b-tab>

                    <!--Submissionquestionnaire Wizard-->
                    <b-tab title="Submissionquestionnaire">
                        <SubmissionQuestionnaireWizard></SubmissionQuestionnaireWizard>
                    </b-tab>

                    <!--Reviewquestionnaire Wizard-->
                    <b-tab v-if="assignment.reviewEvaluation" title="Reviewquestionnaire">
                        <ReviewQuestionnaireWizard></ReviewQuestionnaireWizard>
                    </b-tab>

                    <!--Submissions-->
                    <b-tab title="Submissions">
                        <Submissions :assignmentId="assignment.id"></Submissions>
                    </b-tab>

                    <!--Reviews-->
                    <b-tab title="Reviews">
                        <Reviews
                            :assignmentId="assignment.id"
                            :pathName="'teacher-dashboard.assignments.assignment.review'"
                        ></Reviews>
                    </b-tab>
                </b-tabs>
            </b-card>
        </b-container>
    </div>
</template>

<script>
import api from "../../../api/api"
import _ from "lodash"
import BreadcrumbTitle from "../../BreadcrumbTitle"
import SubmissionQuestionnaireWizard from "../questionnaire/SubmissionQuestionnaireWizard"
import ReviewQuestionnaireWizard from "../questionnaire/ReviewQuestionnaireWizard"
import Groups from "../Groups"
import Reviews from "../../ta_teacher_shared/Reviews"
import Submissions from "../../ta_teacher_shared/Submissions"
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
        BreadcrumbTitle,
        SubmissionQuestionnaireWizard,
        ReviewQuestionnaireWizard,
        Groups,
        Reviews,
        Submissions,
        AssignmentDetails
    },
    data() {
        return {
            assignment: null,
            assignmentStates: [
                { name: "unpublished", icon: "fas fa-eye-slash" },
                { name: "submission", icon: "fas fa-file-pdf" },
                { name: "waitingforreview", icon: "fas fa-user-clock" },
                { name: "review", icon: "fas fa-glasses" },
                { name: "feedback", icon: "fas fa-comments" }
            ]
        }
    },
    computed: {
        currentStateIndex() {
            if (!this.assignment) {
                return -1
            }
            return _.findIndex(this.assignmentStates, o => {
                return o.name === this.assignment.state
            })
        }
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
            await api.assignments.publish(this.$route.params.assignmentId)
            this.showSuccessMessage({ message: "Assignment succesfully published" })
            await this.fetchAssignment()
        },
        async closeSubmission() {
            await api.assignments.closeSubmission(this.$route.params.assignmentId)
            this.showSuccessMessage({ message: "Assignment succesfully closed" })
            await this.fetchAssignment()
        },
        async distributeReviews() {
            await api.reviewofsubmissions.distribute(this.$route.params.assignmentId)
            this.showSuccessMessage({ message: "Reviews succesfully assigned" })
            await this.fetchAssignment()
        },
        async openFeedback() {
            await api.reviewofsubmissions.openFeedback(this.$route.params.assignmentId)
            this.showSuccessMessage({ message: "Feedback succesfully opened" })
            await this.fetchAssignment()
        }
    }
}
</script>
