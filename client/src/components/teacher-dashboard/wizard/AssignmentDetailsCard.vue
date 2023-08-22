<template>
    <div>
        <b-card class="m-5">
            <h1 class="text-center custom-margin" style="font-size: 5rem">This is a question</h1>
            <div class="row">
                <div class="col-md-6">
                    <b-button variant="primary" size="lg" block class="custom-button">Button 1</b-button>
                </div>
                <div class="col-md-6">
                    <b-button variant="secondary" size="lg" block class="custom-button">Button 2</b-button>
                </div>
            </div>
        </b-card>
    </div>
</template>

<script>
export default {
    name: "AssignmentDetailsCard",
}
</script>

<style scoped>
.custom-margin {
    margin-bottom: 20rem;
}
.custom-button {
    font-size: 1.5rem;
    padding: 20px 30px;
}
</style>
