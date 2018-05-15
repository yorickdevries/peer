<template>
    <b-container fluid class="px-0">
        <b-row>

            <!--Assignment Details-->
            <b-col>
                <h5>Assignment Details</h5>
                <span class="font-weight-bold">Description</span>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Commodi consequuntur dolor illum impedit minus neque non quasi quis repudiandae.
                    At atque culpa dicta eaque et molestias nulla quibusdam reiciendis sunt.
                </p>
                <span class="font-weight-bold">Peer Review Setup</span>
                <p>
                    You will make the assignment as a <b-badge variant="success ml-1">GROUP</b-badge>
                    <br>
                    You will review the assignment as a <b-badge variant="success ml-1">INDIVIDUAL STUDENT</b-badge>
                </p>
                <span class="font-weight-bold">Download</span>
                <b-button variant="primary w-100">Download Assignment</b-button>
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
    data() {
        return {
            file: true
        }
    }
}
</script>
