<template>
    <b-container>
        <b-row>
            <b-col>
                <b-card header="Rubric Wizard" class="mt-4">
                    <b-card header="Question 1">

                    </b-card>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
export default {
    data() {
        return {
            rubric: rubric
        }
    },
    async created() {

    }
}

let rubric = {
    "id": "4",
    "assignment_id": "4",
    "questions": [
        {
            "id": 5,
            "type_question": "mc",
            "question": "Choose an option2",
            "question_number": 3,
            "option": [
                {
                    "id": 13,
                    "option": "Option 1 (1)",
                    "mcquestion_id": 5
                },
                {
                    "id": 14,
                    "option": "Option 2 (1)",
                    "mcquestion_id": 5
                },
                {
                    "id": 15,
                    "option": "Option 3 (1)",
                    "mcquestion_id": 5
                }
            ]
        },
        {
            "id": 8,
            "question": "Some open question5",
            "rubric_assignment_id": 4,
            "question_number": 1,
            "type_question": "open"
        },
        {
            "id": 16,
            "question": "Hallo, this is a open!",
            "rubric_assignment_id": 4,
            "question_number": 4,
            "type_question": "open"
        },
        {
            "id": 6,
            "question": "Give a rating",
            "range": 7,
            "rubric_assignment_id": 4,
            "question_number": 2,
            "type_question": "range"
        }
    ]
}
</script>