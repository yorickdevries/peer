import ensureConnection from "../util/ensureConnection";

const importWebLabSubmissions = async function (
  assignmentVersionId: number,
  file: Express.Multer.File
): Promise<string> {
    await ensureConnection();

    return "";
}

export default importWebLabSubmissions;