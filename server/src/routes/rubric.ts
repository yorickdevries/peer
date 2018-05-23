import RubricPS from "../prepared_statements/rubric_ps"

// Router
import { Router } from "express";
const router = Router();

export default router;


router.get("/:rubric_id", async (req, res) => {
   const rubric_id = req.params.rubric_id;
   let mcQuestions = await RubricPS.executeGetAllMCQuestionById(rubric_id);
   let openQuestions = await RubricPS.executeGetAllOpenQuestionById(rubric_id);
   let rangeQuestions = await RubricPS.executeGetAllRangeQuestionById(rubric_id);
   let mcoptions = await RubricPS.executeGetAllMCOptionById(1);
   console.log(mcoptions);
   let questionJson = [];

   for (var i = 0; i<mcQuestions.length; i++) {
        questionJson.push({
           id: mcQuestions[i].id,
           type_question: mcQuestions[i].type_question,
           question: mcQuestions[i].question,
           question_number: mcQuestions[i].question_number,
           option: await RubricPS.executeGetAllMCOptionById(mcQuestions[i].id)
       });
   }


   for (var i = 0; i<openQuestions.length; i++) {
       questionJson.push(openQuestions[i]);
   }

   for (var i = 0; i<rangeQuestions.length; i++) {
       questionJson.push(rangeQuestions[i]);
   }


   console.log(questionJson);
    // console.log(mcQuestions);
   // console.log(openQuestions);
   // console.log(rangeQuestions)

});