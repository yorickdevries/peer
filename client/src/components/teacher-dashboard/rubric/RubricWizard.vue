<template>
    <b-container>
        <b-row>
            <b-col>
                <b-card header="Rubric Wizard" class="mt-4">

                    <b-card v-for="question in rubric.questions"
                            :key="question.id"
                            class="mb-3"
                    no-body>

                        <b-card-header>
                            <span>Question {{ question.question_number}}</span>
                            <b-button variant="outline-danger" size="sm" class="float-right">Delete</b-button>
                        </b-card-header>

                        <b-card-body v-if="question.type_question === 'open'">

                            <b-form-group label="Question text:">
                                <b-form-textarea v-model="question.question">

                                </b-form-textarea>
                            </b-form-group>


                        </b-card-body>

                        <b-card-footer>
                            <b-button variant="outline-primary" size="sm">Save</b-button>
                        </b-card-footer>



                    </b-card>

                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import api from "../../../api";

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