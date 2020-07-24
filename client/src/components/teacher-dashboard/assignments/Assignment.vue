<template>
    <div>
        <b-container>
            <!--Header and action-->
            <BreadcrumbTitle :items="['Assignments', assignment.title]" class="mt-3">
                <b-button
                    variant="success"
                    :to="{
                        name: 'teacher-dashboard.assignments.assignment.edit',
                        params: { courseId: course.id, assignmentId: assignment.id }
                    }"
                >
                    Edit assignment
                </b-button>
            </BreadcrumbTitle>

            <b-row>
                <b-col>
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
                                                <dt>Assign reviews</dt>
                                                <dd>
                                                    This action will shuffle the groups and assign the groups to each
                                                    other.
                                                </dd>
                                                <dd>
                                                    <b-form-checkbox
                                                        id="selfAssign"
                                                        name="selfAssign"
                                                        v-model="selfAssign"
                                                    >
                                                        <small>
                                                            I want to let students review their own assignments.
                                                        </small>
                                                    </b-form-checkbox>
                                                </dd>
                                                <b-button
                                                    v-b-modal="`shufflingModal`"
                                                    class="mb-3"
                                                    variant="primary"
                                                    size="sm"
                                                    >Assign reviews
                                                </b-button>
                                                <b-modal
                                                    id="shufflingModal"
                                                    @ok="shuffleGroups()"
                                                    title="Confirmation"
                                                    centered
                                                >
                                                    Are you sure you want to assign the reviews?
                                                    <ul>
                                                        <li>Can (and should be) done only once per assignment.</li>
                                                        <li>
                                                            Make sure to assign reviews after students have made their
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
                                                <template v-if="assignment.one_person_groups">
                                                    <dt>Import groups</dt>
                                                    <dd>
                                                        Not available. On creation of the assignment, this assignment
                                                        has been set as individual.
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
                                                    >
                                                        Import groups
                                                    </b-button>
                                                </template>

                                                <!--Copying-->
                                                <template v-if="assignment.one_person_groups">
                                                    <dt>Copy groups</dt>
                                                    <dd>
                                                        Not available. On creation of the assignment, this assignment
                                                        has been set as individual.
                                                    </dd>
                                                </template>
                                                <template v-else>
                                                    <dt>Copy groups</dt>
                                                    <dd>
                                                        This action will import the groups of another assignment to this
                                                        assignment.
                                                    </dd>
                                                    <b-button v-b-modal="'copyGroups'" variant="primary" size="sm"
                                                        >Copy groups</b-button
                                                    >
                                                </template>

                                                <hr />

                                                <!--Exporting Reviews-->
                                                <dt>Export reviews</dt>
                                                <dd>Exports a file with all reviews for this assignment.</dd>
                                                <dd>
                                                    Also includes any evaluations which students have given to each
                                                    other's reviews.
                                                </dd>
                                                <b-button
                                                    size="sm"
                                                    variant="primary"
                                                    :href="
                                                        `/api/oldroutes/assignments/${assignment.id}/reviewsExport/csv`
                                                    "
                                                    class="mb-3 mr-2"
                                                >
                                                    Download reviews .csv
                                                </b-button>
                                                <b-button
                                                    size="sm"
                                                    variant="primary"
                                                    :href="
                                                        `/api/oldroutes/assignments/${assignment.id}/reviewsExport/xls`
                                                    "
                                                    class="mb-3"
                                                >
                                                    Download reviews .xls
                                                </b-button>

                                                <!--Exporting Grades-->
                                                <dt>Export grades</dt>
                                                <dd>
                                                    Exports a file with an aggregation of the review
                                                    approval/disapproval amounts of each student for this assignment.
                                                </dd>
                                                <b-button
                                                    class="mr-2"
                                                    size="sm"
                                                    variant="primary"
                                                    :href="
                                                        `/api/oldroutes/assignments/${assignment.id}/gradeExport/csv`
                                                    "
                                                >
                                                    Download grades .csv
                                                </b-button>
                                                <b-button
                                                    size="sm"
                                                    variant="primary"
                                                    :href="
                                                        `/api/oldroutes/assignments/${assignment.id}/gradeExport/xls`
                                                    "
                                                >
                                                    Download grades .xls
                                                </b-button>
                                            </dl>

                                            <!--Import Group Modal-->
                                            <b-modal
                                                id="importGroups"
                                                centered
                                                hide-header
                                                hide-footer
                                                class="p-0 m-0"
                                                size="lg"
                                            >
                                                <ImportGroupsWizard :assignmentId="assignment.id"></ImportGroupsWizard>
                                            </b-modal>

                                            <b-modal
                                                id="copyGroups"
                                                centered
                                                hide-header
                                                hide-footer
                                                class="p-0 m-0"
                                                size="lg"
                                            >
                                                <CopyGroupsWizard
                                                    :assignmentId="assignment.id"
                                                    :courseId="course.id"
                                                ></CopyGroupsWizard>
                                            </b-modal>
                                        </b-card>
                                    </b-col>
                                </b-row>
                            </b-tab>

                            <!--Rubric Wizard-->
                            <b-tab title="Rubric">
                                <RubricWizard
                                    :assignmentId="assignment.id"
                                    :review_publish_date="assignment.review_publish_date"
                                ></RubricWizard>
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

                            <!--Groups-->
                            <b-tab title="Groups">
                                <Groups :assignmentId="assignment.id"></Groups>
                            </b-tab>
                        </b-tabs>
                    </b-card>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import api from "../../../api/api_old"
import BreadcrumbTitle from "../../BreadcrumbTitle"
import RubricWizard from "../rubric/RubricWizard"
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
        RubricWizard,
        Groups,
        ImportGroupsWizard,
        Reviews,
        Submissions,
        AssignmentDetails
    },
    async created() {
        let cid = this.$route.params.courseId
        let aid = this.$route.params.assignmentId
        this.course.id = cid
        this.assignment.id = aid
        let res = await api.getAssignment(aid)
        this.assignment = res.data
    },
    data() {
        return {
            selfAssign: false,
            course: {
                id: null
            },
            assignment: {
                id: null,
                title: null,
                description: null,
                publish_date: null,
                due_date: null,
                review_publish_date: null,
                review_due_date: null,
                filename: null,
                one_person_groups: null
            }
        }
    },
    methods: {
        formatDate(date) {
            // Formats the date to a readable format for the UI.
            if (!(date instanceof Date)) date = new Date(date)
            return `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}`
        },
        async shuffleGroups() {
            try {
                // Check if the user wants to self-assign shuffle instead.
                if (this.selfAssign) {
                    await api.client.get(`/assignments/${this.$route.params.assignmentId}/distributeReviews/1`)
                } else {
                    await api.client.get(`/assignments/${this.$route.params.assignmentId}/distributeReviews/0`)
                }

                this.showSuccessMessage({ message: "Groups have successfully been shuffled and assigned submissions." })
            } catch (e) {
                this.showErrorMessage({ message: e.response.data.error })
            }
        },
        async submitAllFilledReviews() {
            try {
                let res = await api.client.get(`rubric/submissionrubric/${this.$route.params.assignmentId}`)
                const rubricId = res.data.id
                const result = await api.submitAllFilledReviews(rubricId)
                const submittedReviews = result.data.submittedReviews
                this.showSuccessMessage({ message: "Submitted " + submittedReviews + " Reviews" })
            } catch (e) {
                this.showErrorMessage({ message: e.response.data.error })
            }
        }
    }
}
</script>
