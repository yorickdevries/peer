<template>
    <div>
        <b-container>

            <!--Header-->
            <b-row>
                <b-col>
                    <h1 class="mt-5">{{course.name}} | Teacher Course Home</h1>
                </b-col>
            </b-row>

            <!--Course description card-->
            <b-row>
                <b-col>
                    <b-card no-body>
                        <b-card-body>
                            <h4 class="card-title mb-0">Course description</h4>
                        </b-card-body>
                        <b-list-group flush>
                            <b-list-group-item class="flex-column align-items-start">
                                <div class="d-flex w-100 justify-content-between">
                                    <p class="mb-1">
                                        {{course.description}}
                                    </p>
                                </div>
                            </b-list-group-item>
                        </b-list-group>
                    </b-card>
                </b-col>
            </b-row>

        </b-container>
    </div>
</template>

<script>
import api from '../../api'

export default {
    data() {
        return {
            id: null,
            course: {
                name: null,
                description: null
            },
        }
    },
    async created() {
        let id = this.$route.params.id
        this.id = id
        let res = await api.getCourse(id)
        this.course = res.data
    }

}
</script>
