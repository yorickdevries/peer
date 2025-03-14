import http from "http";
import request from "supertest";
import AssignmentType from "../../src/enum/AssignmentType";

export default async function patchAssignmentRequest(
  server: http.Server,
  assignmentId: number,
  sessionCookie: string,
  assignmentType?: string,
  sendNotificationEmails?: boolean
): Promise<request.Response> {
  return await request(server)
    .patch(`/api/assignments/${assignmentId}`)
    .set("cookie", sessionCookie)
    .field("name", "Example title")
    .field("enrollable", true)
    .field("reviewEvaluation", false)
    .field("publishDate", new Date("2020-06-23T10:00Z").toISOString())
    .field("dueDate", new Date("2020-06-24T10:00Z").toISOString())
    .field("reviewPublishDate", new Date("2020-06-25T10:00Z").toISOString())
    .field("reviewDueDate", new Date("2020-06-26T10:00Z").toISOString())
    .field("reviewEvaluationDueDate", "null")
    .field("description", "Example description")
    .field("externalLink", "null")
    .field("submissionExtensions", ".pdf")
    .field("blockFeedback", true)
    .field("lateSubmissions", true)
    .field("lateSubmissionReviews", true)
    .field("lateReviewEvaluations", "null")
    .field("automaticStateProgression", false)
    .field("assignmentType", assignmentType ?? AssignmentType.DOCUMENT)
    .field("sendNotificationEmails", sendNotificationEmails ?? true);
}
