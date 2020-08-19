<template>
    <div>
        <b-container>
            <!--Header and action-->
            <BreadcrumbTitle :items="['Course Home']" class="mt-3">
                <b-button
                    variant="success"
                    :to="{ name: 'teacher-dashboard.course.edit', params: { courseId: course.id } }"
                    >Edit course
                </b-button>
            </BreadcrumbTitle>

            <b-row>
                <!--Course description card-->
                <b-col cols="8">
                    <b-card header="Description">
                        <div class="d-flex w-100 justify-content-between">
                            <p class="mb-1" v-if="course.description != null">{{ course.description }}</p>
                            <p v-else><i>No course description</i></p>
                        </div>
                    </b-card>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import api from "../../api/api"
import BreadcrumbTitle from "../BreadcrumbTitle"

export default {
    components: { BreadcrumbTitle },
    data() {
        return {
            course: {}
        }
    },
    async created() {
        let res = await api.courses.get(this.$route.params.courseId)
        this.course = res.data
    }
}
</script>
