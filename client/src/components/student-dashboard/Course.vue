<template>
    <b-container>
        <!--Header-->
        <b-row>
            <b-col>
                <BreadcrumbTitle :items="['Course Home']" class="mt-3" />
            </b-col>
        </b-row>

        <!--Blogpost-->
        <b-row>
            <b-col>
                <b-card no-body>
                    <b-card-body>
                        <h4 class="card-title mb-0">Course Announcements</h4>
                    </b-card-body>

                    <!--Blogpost Items-->
                    <b-list-group flush>
                        <b-list-group-item href="#" class="flex-column align-items-start">
                            <div class="d-flex w-100 justify-content-between">
                                <h5 class="mb-1">Blog title</h5>
                                <small>3 days ago</small>
                            </div>
                            <p class="mb-1">
                                Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius
                                blandit.
                            </p>
                            <small>Donec id elit non mi porta.</small>
                        </b-list-group-item>
                        <b-list-group-item href="#" class="flex-column align-items-start">
                            <div class="d-flex w-100 justify-content-between">
                                <h5 class="mb-1">Blog title</h5>
                                <small>3 days ago</small>
                            </div>
                            <p class="mb-1">
                                Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius
                                blandit.
                            </p>
                            <small>Donec id elit non mi porta.</small>
                        </b-list-group-item>
                    </b-list-group>
                </b-card>
            </b-col>

            <b-col cols="4">
                <!--Course Information-->
                <b-card no-body>
                    <b-card-body>
                        <h4 class="card-title">Course Information</h4>
                        <span class="font-weight-bold">Description</span>
                        <p v-if="course.description != null">{{ course.description | truncate(200) }}</p>
                        <p v-else><i>No course description</i></p>
                    </b-card-body>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import api from "../../api"
import BreadcrumbTitle from "../BreadcrumbTitle"

export default {
    components: { BreadcrumbTitle },
    data() {
        return {
            course: {
                name: null,
                description: null
            }
        }
    },
    async created() {
        // Fetch course information.
        let res = await api.getCourse(this.$route.params.courseId)
        this.course = res.data
    }
}
</script>
