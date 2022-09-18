<template>
    <b-container>
        <!--Header-->
        <BreadcrumbTitle :items="['Admin Home']" class="mt-3"></BreadcrumbTitle>
    </b-container>
</template>

<script>
import BreadcrumbTitle from "@/components/BreadcrumbTitle"

export default {
    name: "Home",
    components: { BreadcrumbTitle }
}
</script>
