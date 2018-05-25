<template>
    <b-container>

        <b-row>
            <b-col>
                <b-breadcrumb :items="items" class="mt-3"/>
            </b-col>
        </b-row>

        <b-row>
            <b-col>
                <b-card no-body>
                    <b-card-body>
                        <h4 class="card-title mb-0">Course Announcements</h4>
                    </b-card-body>
                    <b-list-group flush>
                        <b-list-group-item href="#" class="flex-column align-items-start">
                            <div class="d-flex w-100 justify-content-between">
                                <h5 class="mb-1">Blog title</h5>
                                <small>3 days ago</small>
                            </div>
                            <p class="mb-1">
                                Donec id elit non mi porta gravida at eget metus. Maecenas
                                sed diam eget risus varius blandit.
                            </p>
                            <small>Donec id elit non mi porta.</small>
                        </b-list-group-item>
                        <b-list-group-item href="#" class="flex-column align-items-start">
                            <div class="d-flex w-100 justify-content-between">
                                <h5 class="mb-1">Blog title</h5>
                                <small>3 days ago</small>
                            </div>
                            <p class="mb-1">
                                Donec id elit non mi porta gravida at eget metus. Maecenas
                                sed diam eget risus varius blandit.
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
                        <p> {{course.description}}</p>

                    </b-card-body>
                </b-card>

                <!--Group Information-->
                <b-card no-body class="mt-3">
                    <b-card-body>
                        <h4 class="mb-0">Group Members</h4>
                    </b-card-body>
                    <b-list-group flush>
                        <b-list-group-item v-for="member in members" :key="member">{{ member }}</b-list-group-item>
                    </b-list-group>
                </b-card>
            </b-col>
        </b-row>

    </b-container>
</template>

<script>
import api from "../../api"

export default {
    async created() {
        let res = await api.getCourse(this.$route.params.courseId)

        this.course = res.data

        console.log(true)
    },
    data() {
        return {
            items: [
                {
                    text: 'Course Home',
                    active: true
                }
            ],
            course: {
                name: null,
                description: null
            },
            members: ["User 1", "User 2", "User 3", "User 4", "User 5"]
        }
    }
}
</script>
