<template>
    <div>

        <!--Title Card with Download Button-->
        <b-card no-body>
            <b-card-body>
                <b-container fluid class="px-0">
                    <b-row>
                        <b-col>
                            <span class="text-muted">You are giving feedback to</span><br>
                            <span class="lead">Peer #1</span>
                        </b-col>
                        <b-col>
                            <b-button variant="success w-100 h-100">Download Hand-In</b-button>
                        </b-col>
                    </b-row>
                </b-container>
            </b-card-body>
        </b-card>

        <b-card no-body class="mt-3">
            <b-card-body>
                <h4>Assignment Criteria</h4>

                <div class="mb-3 bottom-right">
                    <h5 class="text-primary">Question 1 of 10.</h5>
                    <p>
                        How well has the author done?
                    </p>
                    <b-form-textarea id="textarea1"
                                     v-model="text"
                                     placeholder="Enter something"
                                     :rows="3"
                                     :max-rows="6" />
                </div>

                <div class="mb-3 bottom-right">
                    <h5 class="text-primary">Question 2 of 10.</h5>
                    <p>
                        How well has the author done?
                    </p>
                    <b-form-textarea id="textarea1"
                                     v-model="text"
                                     placeholder="Enter something"
                                     :rows="3"
                                     :max-rows="6" />
                </div>

                <div class="mb-3 bottom-right">
                    <h5 class="text-primary">Question 3 of 10.</h5>
                    <p>
                        How well has the author done?
                    </p>
                    <b-form-textarea id="textarea1"
                                     v-model="text"
                                     placeholder="Enter something"
                                     :rows="3"
                                     :max-rows="6" />
                </div>

                <div class="mb-3 bottom-right">
                    <h5 class="text-primary">Question 4 of 10.</h5>
                    <p>
                        How well has the author done?
                    </p>
                    <b-form-textarea id="textarea1"
                                     v-model="text"
                                     placeholder="Enter something"
                                     :rows="3"
                                     :max-rows="6" />
                </div>

                <b-button variant="success float-right">Submit Review</b-button>

            </b-card-body>
        </b-card>

    </div>
</template>
