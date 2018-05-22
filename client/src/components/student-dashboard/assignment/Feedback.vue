<template>
    <div>

        <!--Title Card with Download Button-->
        <b-card no-body>
            <b-card-body>
                <b-container fluid class="px-0">
                    <b-row>
                        <b-col>
                            <span class="text-muted">This is feedback from</span><br>
                            <span class="lead">Question #1</span>
                        </b-col>
                        <b-col>
                            <b-button variant="danger" class="w-100 h-100">Report to TA</b-button>
                        </b-col>
                    </b-row>
                </b-container>
            </b-card-body>
        </b-card>

        <b-card no-body class="mt-3">
            <b-card-body>
                <h4>Feedback Given
                </h4>
                <p>
                    How well has the author done?
                </p>

                <div class="mb-3 bottom-right">
                    <h5 class="text-primary">Peer #1</h5>
                    <b-form-textarea id="textarea1"
                                     v-model="text"
                                     placeholder="Enter something"
                                     :rows="3"
                                     :max-rows="6"
                                     disabled
                                     value="Sample comment given by other student."
                    />
                </div>

                <div class="mb-3 bottom-right">
                    <h5 class="text-primary">Peer #2</h5>
                    <b-form-textarea id="textarea1"
                                     v-model="text"
                                     placeholder="Enter something"
                                     :rows="3"
                                     :max-rows="6"
                                     disabled
                                     value="Sample comment given by other student."
                    />
                </div>

                <div class="mb-3 bottom-right">
                    <h5 class="text-primary">Peer #3</h5>
                    <b-form-textarea id="textarea1"
                                     v-model="text"
                                     placeholder="Enter something"
                                     :rows="3"
                                     :max-rows="6"
                                     disabled
                                     value="Sample comment given by other student."
                    />
                </div>

            </b-card-body>
        </b-card>

    </div>
</template>

<script>
export default {
    data() {
        return {
            text: null,
        }
    }
}
</script>

