import _ from "lodash";
import { getManager } from "typeorm";
import QuestionAnswer from "../models/QuestionAnswer";
import Questionnaire from "../models/Questionnaire";
import Review from "../models/Review";

// submit review if fully filled in
const submitReview = async function (
  review: Review,
  flaggedByReviewer?: boolean
): Promise<Review> {
  await getManager().transaction(
    "REPEATABLE READ",
    async (transactionalEntityManager) => {
      // reload the review in transaction
      review = await transactionalEntityManager.findOneOrFail(
        Review,
        review.id
      );
      // change flagged by review if its passed in the method
      if (flaggedByReviewer !== undefined) {
        review.flaggedByReviewer = flaggedByReviewer;
      }
      // check whether the review is allowed to be submitted
      if (!review.flaggedByReviewer) {
        // check whether all non-optional questions are answered
        const answers = await transactionalEntityManager
          .createQueryBuilder(QuestionAnswer, "question_answer")
          .setLock("pessimistic_write")
          .where("reviewId = :rid", { rid: review.id })
          .getMany();
        const questionnaire = await transactionalEntityManager.findOneOrFail(
          Questionnaire,
          review.questionnaireId
        );
        for (const question of questionnaire.questions) {
          // only check question if not optional
          if (!question.optional) {
            const answer = _.find(answers, (answer) => {
              return answer.questionId === question.id;
            });
            // if no answer is present, throw error
            if (!answer) {
              throw new Error(
                `Non-optional question with id ${question.id} isn't answered yet`
              );
            }
          }
        }
      }
      // set submitted on true and save review
      review.submitted = true;
      review.submittedAt = new Date();
      // do not validate as this might block transaction
      // await review.validateOrReject();
      await transactionalEntityManager.save(review);
    }
  );
  await review.reload();
  return review;
};

export default submitReview;
