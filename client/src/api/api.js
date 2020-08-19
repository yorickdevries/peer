import client from "./axiosClient"
// subroutes
import users from "./users"
import faculties from "./faculties"
import academicYears from "./academicyyears"
import courses from "./courses"
import enrollments from "./enrollments"
import assignments from "./assignments"
import submissionquestionnaires from "./submissionquestionnaires"
import reviewquestionnaires from "./reviewquestionnaires"
import openquestions from "./openquestions"
import multiplechoicequestions from "./multiplechoicequestions"
import multiplechoicequestionoptions from "./multiplechoicequestionoptions"
import checkboxquestions from "./checkboxquestions"
import checkboxquestionoptions from "./checkboxquestionoptions"
import rangequestions from "./rangequestions"
import uploadquestions from "./uploadquestions"
import groups from "./groups"
import submissions from "./submissions"
import reviewofsubmissions from "./reviewofsubmissions"
import reviewofreviews from "./reviewofreviews"
import openquestionanswers from "./openquestionanswers"
import multiplechoicequestionanswers from "./multiplechoicequestionanswers"
import checkboxquestionanswers from "./checkboxquestionanswers"
import rangequestionanswers from "./rangequestionanswers"
import uploadquestionanswers from "./uploadquestionanswers"

export default {
    getAuthenticated: () => {
        return client.get("authenticated")
    },
    getMe() {
        return client.get("me")
    },
    users: users,
    faculties: faculties,
    academicYears: academicYears,
    courses: courses,
    enrollments: enrollments,
    assignments: assignments,
    submissionquestionnaires: submissionquestionnaires,
    reviewquestionnaires: reviewquestionnaires,
    openquestions: openquestions,
    multiplechoicequestions: multiplechoicequestions,
    multiplechoicequestionoptions: multiplechoicequestionoptions,
    checkboxquestions: checkboxquestions,
    checkboxquestionoptions: checkboxquestionoptions,
    rangequestions: rangequestions,
    uploadquestions: uploadquestions,
    groups: groups,
    submissions: submissions,
    reviewofsubmissions: reviewofsubmissions,
    reviewofreviews: reviewofreviews,
    openquestionanswers: openquestionanswers,
    multiplechoicequestionanswers: multiplechoicequestionanswers,
    checkboxquestionanswers: checkboxquestionanswers,
    rangequestionanswers: rangequestionanswers,
    uploadquestionanswers: uploadquestionanswers
}
