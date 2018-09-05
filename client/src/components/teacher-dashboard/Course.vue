<template>
    <div>
        <b-container>

            <!--Header and action-->
            <BreadcrumbTitle :items="['Course Home']" class="mt-3">
                <b-button variant="success"
                          :to="{ name: 'teacher-dashboard.course.edit', params: {courseId: course.id} }">Edit course
                </b-button>
            </BreadcrumbTitle>

            <b-row>

                <!--Course description card-->
                <b-col cols="8">
                    <b-card header="Description">
                        <div class="d-flex w-100 justify-content-between">
                            <p class="mb-1">
                                {{course.description}}
                            </p>
                        </div>
                    </b-card>
                </b-col>

                <!--Export-->
                <b-col cols="4">
                    <b-card header="Export">
                        <dl class="mb-0">
                            <dt>Export Review Grades</dt>
                            <dd>Exports a CSV file with an aggregation of the review approval/disapproval amounts of
                                each student for all the assignments in the course.
                            </dd>
                            <b-button variant="primary" size="sm" :href="`/api/courses/${course.id}/gradeExport`">Download CSV</b-button>
                        </dl>

                    </b-card>
                </b-col>
            </b-row>

        </b-container>
    </div>
</template>

<script>
    import api from '../../api'
    import BreadcrumbTitle from '../BreadcrumbTitle'

    export default {
        components: {BreadcrumbTitle},
        data() {
            return {
                course: {
                    id: null,
                    name: null,
                    description: null
                },
            }
        },
        async created() {
            let id = this.$route.params.courseId
            this.course.id = id
            let res = await api.getCourse(id)
            this.course = res.data
        }

    }
</script>
