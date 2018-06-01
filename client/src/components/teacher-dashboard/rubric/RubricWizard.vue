<template>
    <b-container>
        <b-row>
            <b-col>
                <b-card header="Rubric Wizard" class="mt-4">

                    <b-card v-for="question in rubric.questions"
                            :key="question.id"
                            :header="`Question ${question.question_number}`"
                            class="mb-3">

                            <template v-if="question.type_question === 'open'">
                                <b-form-group label="Question text:">
                                    <b-form-textarea v-model="question.question">

                                    </b-form-textarea>
                                </b-form-group>
                            </template>


                        <b-button @click="saveQuestion(question)" variant="outline-primary" size="sm" class="mr-1">Save</b-button>
                        <b-button @click="deleteQuestion(question)" variant="outline-danger" size="sm">Delete</b-button>

                    </b-card>

                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import api from "../../../api";
import VueNotifications from 'vue-notifications'

let apiPrefixes = {
    open: '/rubric/openquestion/',
    mc: '/rubric/mcquestion/',
    range: '/rubric/rangequestion/'
}
export default {
    data() {
        return {
            rubric: {}
        }
    },
    async created() {
        await this.fetchRubric()
    },
    methods: {
        async fetchRubric() {
            let res = await api.client.get(`/rubric/4`)
            this.rubric = res.data
        },
        async deleteQuestion(question) {
            await api.client.delete(`${apiPrefixes[question.type_question]}/${question.id}`);
            this.showSuccessMessage({message: 'Successfully deleted question.'})
            await this.fetchRubric()
        },
        async saveQuestion(question) {
            await api.client.delete(`${apiPrefixes[question.type_question]}/${question.id}`)
            console.log(res)
            this.showSuccessMessage({message: 'Successfully saved question.'})
            await this.fetchRubric()
        }

    },
    notifications: {
        showSuccessMessage: {
            type: VueNotifications.types.success,
            title: 'Success',
            message: 'Success.'
        },
        showErrorMessage: {
            type: VueNotifications.types.error,
            title: 'Error',
            message: 'Error.'
        }
    }
}

// let rubric = {
//     "id": "4",
//     "assignment_id": "4",
//     "questions": [
//         {
//             "id": 5,
//             "type_question": "mc",
//             "question": "Choose an option2",
//             "question_number": 3,
//             "option": [
//                 {
//                     "id": 13,
//                     "option": "Option 1 (1)",
//                     "mcquestion_id": 5
//                 },
//                 {
//                     "id": 14,
//                     "option": "Option 2 (1)",
//                     "mcquestion_id": 5
//                 },
//                 {
//                     "id": 15,
//                     "option": "Option 3 (1)",
//                     "mcquestion_id": 5
//                 }
//             ]
//         },
//         {
//             "id": 8,
//             "question": "Some open question5",
//             "rubric_assignment_id": 4,
//             "question_number": 1,
//             "type_question": "open"
//         },
//         {
//             "id": 16,
//             "question": "Hallo, this is a open!",
//             "rubric_assignment_id": 4,
//             "question_number": 4,
//             "type_question": "open"
//         },
//         {
//             "id": 6,
//             "question": "Give a rating",
//             "range": 7,
//             "rubric_assignment_id": 4,
//             "question_number": 2,
//             "type_question": "range"
//         }
//     ]
// }
</script>