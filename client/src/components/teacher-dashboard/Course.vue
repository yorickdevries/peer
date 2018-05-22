<template>
    <div>
        <b-container>

            <b-row>
                <b-col>
                    <h1 class="mt-5">Teacher Course Home</h1>
                    <b-breadcrumb :items="crumbs"/>
                </b-col>
            </b-row>

        </b-container>
    </div>
</template>

<script>
export default {
    data() {
        return {
            crumbs: [
                {
                    text: 'Dashboard',
                    to: {name: 'teaching-assistant-dashboard.index'},
                    active: true
                }
            ]
        }
    }
}
</script>
