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
                                                        The submission questionnaire cannot be changed after this
                                                        action.
                                                    </li>
                                                </ul>
                                            </b-modal>
                                        </div>

                                        <!--Submit Reviews-->
                                        <dt>Submit Reviews</dt>
                                        <dd>
                                            This action will set all reviews which are fully filled in to done.
                                        </dd>
                                        <b-button variant="primary" size="sm" @click="submitAllFilledReviews">
                                            Submit Reviews
                                        </b-button>

                                        <!--Exporting Reviews-->
                                        <dt>Export reviews</dt>
                                        <dd>Exports a file with all reviews for this assignment.</dd>
                                        <dd>
                                            Also includes any evaluations which students have given on eachother's
                                            reviews.
                                        </dd>
                                        <b-button
                                            size="sm"
                                            variant="primary"
                                            :href="
                                                `/api/reviewofsubmissions/exportreviews?assignmentId=${assignment.id}&exportType=csv`
                                            "
                                            class="mb-3 mr-2"
                                        >
                                            Download reviews .csv
                                        </b-button>
                                        <b-button
                                            size="sm"
                                            variant="primary"
                                            :href="
                                                `/api/reviewofsubmissions/exportreviews?assignmentId=${assignment.id}&exportType=xls`
                                            "
                                            class="mb-3"
                                        >
                                            Download reviews .xls
                                        </b-button>

                                        <!--Exporting Grades-->
                                        <dt>Export grades</dt>
                                        <dd>
                                            Exports a file with an aggregation of the review approval/disapproval
                                            numbers of each student for this assignment.
                                        </dd>
                                        <b-button
                                            class="mr-2"
                                            size="sm"
                                            variant="primary"
                                            :href="
                                                `/api/reviewofsubmissions/exportgrades?assignmentId=${assignment.id}&exportType=csv`
                                            "
                                        >
                                            Download grades .csv
                                        </b-button>
                                        <b-button
                                            size="sm"
                                            variant="primary"
                                            :href="
                                                `/api/reviewofsubmissions/exportgrades?assignmentId=${assignment.id}&exportType=xls`
                                            "
                                        >
                                            Download grades .xls
                                        </b-button>
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
        async submitAllFilledReviews() {
            const res = await api.reviewofsubmissions.submitAll(this.$route.params.assignmentId)
            const submittedReviews = res.data
            this.showSuccessMessage({ message: "Submitted " + submittedReviews.length + " Reviews" })
        }
    }
}
</script>
