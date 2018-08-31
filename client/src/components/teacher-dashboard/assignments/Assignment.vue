<template>
    <div>
        <b-container>

            <!--Header and action-->
            <BreadcrumbTitle :items="['Assignments', assignment.title]" class="mt-3">
                <b-button variant="success"
                          :to="{ name: 'teacher-dashboard.assignments.assignment.edit', params: {courseId: course.id, assignmentId: assignment.id} }">
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
                                    <b-col cols="8">
                                        <AssignmentDetails :assignment="assignment"></AssignmentDetails>
                                    </b-col>

                                    <b-col cols="4">
                                        <b-card header="Actions">
                                            <dl class="mb-0">
                                                <!--Shuffling-->
                                                <dt>Shuffle groups</dt>
                                                <dd>This action will shuffle the groups and assign the groups to each
                                                    other. Can only be done once.
                                                </dd>
                                                <b-button @click="shuffleGroups()" class="mb-3" variant="primary" size="sm">Shuffle Groups</b-button>

                                                <!--Importing-->
                                                <template v-if="!assignment.one_person_groups">
                                                    <dt>Import groups</dt>
                                                    <dd>This action will import the groups in the assignment.</dd>
                                                    <b-button v-b-modal="'importGroups'" variant="primary" size="sm">Import groups</b-button>
                                                </template>
                                                <template v-else>
                                                    <dt>Import groups</dt>
                                                    <dd>Not available. On creation of the assignment, this assignment has been set as individual. </dd>
                                                </template>

                                                <!--Exporting-->
                                                <dt>Export CSV</dt>
                                                <dd>Exports a CSV file with an aggregation of the review approval/disapproval amounts of each student for this assignment.</dd>
                                                <b-button size="sm" variant="primary" @click="downloadExport">
                                                    Download CSV
                                                </b-button>

                                            </dl>

                                            <b-modal id="importGroups" centered hide-header hide-footer class="p-0 m-0" size="lg">
                                                <ImportGroupsWizard :assignmentId="assignment.id"></ImportGroupsWizard>
                                            </b-modal>
                                        </b-card>
                                    </b-col>
                                </b-row>
                            </b-tab>

                            <!--Rubric Wizard-->
                            <b-tab title="Rubric">
                                <RubricWizard :rubricId="assignment.id"></RubricWizard>
                            </b-tab>

                            <!--Submissions-->
                            <b-tab title="Submissions">
                                <Submissions :assignmentId="assignment.id"></Submissions>
                            </b-tab>

                            <!--Reviews-->
                            <b-tab title="Reviews">
                                <Reviews :assignmentId="assignment.id" :pathName="'teacher-dashboard.assignments.assignment.review'"></Reviews>
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
import api from '../../../api'
import BreadcrumbTitle from '../../BreadcrumbTitle'
import RubricWizard from '../rubric/RubricWizard'
import ImportGroupsWizard from '../ImportGroupsWizard'
import Groups from '../Groups'
import Reviews from '../../ta_teacher_shared/Reviews'
import Submissions from '../../ta_teacher_shared/Submissions'
import AssignmentDetails from '../../ta_teacher_shared/AssignmentDetails'
import notifications from '../../../mixins/notifications'

export default {
    mixins: [notifications],
    components: {
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
        this.assignment.one_person_groups = true
    },
    data() {
        return {
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
            },
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
                await api.shuffleGroups(this.$route.params.assignmentId)
                this.showSuccessMessage({message: "Groups have successfully been shuffled and assigned submissions."})
            } catch (e) {
                this.showErrorMessage({message: e.response.data.error})
            }
        },
        async downloadExport() {
            const res = await api.client.get(`assignments/${this.assignment.id}/gradeExport`)
            const data = res.data.data
            const link = document.createElement('a')
            link.setAttribute('href', data)
            link.setAttribute('download', 'export.csv')
            link.click()
        }
    }
}
</script>
