<template>
    <b-container fluid class="px-0">
        <b-row>

            <!--Assignment Details-->
            <b-col>
                <h5>Assignment Details</h5>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Commodi consequuntur dolor illum impedit minus neque non quasi quis repudiandae.
                    At atque culpa dicta eaque et molestias nulla quibusdam reiciendis sunt.
                </p>
                <b-button variant="primary">Download</b-button>
            </b-col>

            <!--Hand-In Form-->
            <b-col>
                <h5>Hand-In</h5>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Commodi consequuntur dolor illum impedit minus neque non quasi quis repudiandae.
                    At atque culpa dicta eaque et molestias nulla quibusdam reiciendis sunt.
                </p>
                <b-form-file v-model="file" :state="Boolean(file)" placeholder="Choose a file..."></b-form-file>
            </b-col>

        </b-row>
    </b-container>
</template>

<script>
export default {
    name: "HandIn",
    data() {
        return {
            file: true
        }
    }
}
</script>

<style scoped>

</style>