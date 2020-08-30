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
                                        <!--Shuffling-->
                                        <dt>Distribute Reviews</dt>
                                        <dd>
                                            This action will distribute reviews to users of groups which made a
                                            submission.
                                        </dd>
                                        <b-button
                                            v-b-modal="`distributeReviews`"
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
                                                    Make sure to assign reviews after all students have made their
                                                    submission.
                                                </li>
                                            </ul>
                                        </b-modal>

                                        <!--Submit Reviews-->
                                        <dt>Submit Reviews</dt>
                                        <dd>
                                            This action will set all reviews which are fully filled in to done.
                                        </dd>
                                        <b-button variant="primary" size="sm" @click="submitAllFilledReviews">
                                            Submit Reviews
                                        </b-button>

                                        <hr />

                                        <!--Importing-->
                                        <template v-if="assignment.enrollable">
                                            <dt>Import groups</dt>
                                            <dd>
                                                Not available. On creation of the assignment, this assignment has been
                                                set as self-enrollable.
                                            </dd>
                                        </template>
                                        <template v-else>
                                            <dt>Import groups</dt>
                                            <dd>This action will import the groups in the assignment.</dd>
                                            <b-button
                                                v-b-modal="'importGroups'"
                                                variant="primary"
                                                size="sm"
                                                class="mb-3"
                                                >Import groups
                                            </b-button>

                                            <!--Import Group Modal-->
                                            <b-modal
                                                id="importGroups"
                                                centered
                                                hide-header
                                                hide-footer
                                                class="p-0 m-0"
                                                size="lg"
                                            >
                                                <ImportGroupsWizard></ImportGroupsWizard>
                                            </b-modal>
                                        </template>

                                        <!--Copying-->
                                        <template v-if="assignment.enrollable">
                                            <dt>Copy groups</dt>
                                            <dd>
                                                Not available. On creation of the assignment, this assignment has been
                                                set as self-enrollable.
                                            </dd>
                                        </template>
                                        <template v-else>
                                            <dt>Copy groups</dt>
                                            <dd>
                                                This action will import the groups of another assignment to this
                                                assignment.
                                            </dd>
                                            <b-button v-b-modal="'copyGroups'" variant="primary" size="sm"
                                                >Copy groups
                                            </b-button>
                                            <b-modal
                                                id="copyGroups"
                                                centered
                                                hide-header
                                                hide-footer
                                                class="p-0 m-0"
                                                size="lg"
                                            >
                                                <CopyGroupsWizard></CopyGroupsWizard>
                                            </b-modal>
                                        </template>

                                        <hr />

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
import BreadcrumbTitle from "../../BreadcrumbTitle"
import SubmissionQuestionnaireWizard from "../questionnaire/SubmissionQuestionnaireWizard"
import ReviewQuestionnaireWizard from "../questionnaire/ReviewQuestionnaireWizard"
import ImportGroupsWizard from "../ImportGroupsWizard"
import Groups from "../Groups"
import Reviews from "../../ta_teacher_shared/Reviews"
import Submissions from "../../ta_teacher_shared/Submissions"
import AssignmentDetails from "../../ta_teacher_shared/AssignmentDetails"
import notifications from "../../../mixins/notifications"
import CopyGroupsWizard from "../CopyGroupsWizard"

export default {
    mixins: [notifications],
    components: {
        CopyGroupsWizard,
        BreadcrumbTitle,
        SubmissionQuestionnaireWizard,
        ReviewQuestionnaireWizard,
        Groups,
        ImportGroupsWizard,
        Reviews,
        Submissions,
        AssignmentDetails
    },
    data() {
        return {
            assignment: null
        }
    },
    async created() {
        let res = await api.assignments.get(this.$route.params.assignmentId)
        this.assignment = res.data
    },
    methods: {
        async distributeReviews() {
            console.log(this.$route.params.assignmentId)
            await api.reviewofsubmissions.distribute(this.$route.params.assignmentId)
            this.showSuccessMessage({ message: "Groups have successfully been shuffled and assigned submissions." })
        },
        async submitAllFilledReviews() {
            const res = await api.reviewofsubmissions.submitAll(this.$route.params.assignmentId)
            const submittedReviews = res.data
            this.showSuccessMessage({ message: "Submitted " + submittedReviews.length + " Reviews" })
        }
    }
}
</script>
