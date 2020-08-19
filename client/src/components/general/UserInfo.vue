<template>
    <b-card header="Userinfo">
        <div>NetID: {{ user.netid }}</div>
        <div>Studentnumber: {{ user.studentNumber }}</div>
        <div>Email: {{ user.email }}</div>
        <div>Display name: {{ user.displayName }}</div>
        <div>
            Affiliation:
            <ul>
                <li v-for="item in user.affiliation" :key="item.name">
                    {{ item.name }}
                </li>
            </ul>
        </div>
        <div>
            Study:
            <ul>
                <li v-for="item in user.study" :key="item.name">
                    {{ item.name }}
                </li>
            </ul>
        </div>
        <div>
            Organisation unit:
            <ul>
                <li v-for="item in user.organisationUnit" :key="item.name">
                    {{ item.name }}
                </li>
            </ul>
        </div>
    </b-card>
</template>

<script>
export default {
    props: ["user"]
}
</script>
