import { getManager } from "typeorm";
import AssignmentVersion from "../models/AssignmentVersion";
import ensureConnection from "../util/ensureConnection";
import Group from "../models/Group";
import Submission from "../models/Submission";
import fsPromises from "fs/promises";
import JSZip from "jszip";
import User from "../models/User";
import File from "../models/File";
import config from "config";
import path from "path";

// config value
const uploadFolder = config.get("uploadFolder") as string;

const importWebLabSubmissions = async function (
  assignmentVersionId: number,
  file: Express.Multer.File
): Promise<string> {
  await ensureConnection();

  const assignmentVersion = await AssignmentVersion.findOne(
    assignmentVersionId
  );
  if (!assignmentVersion) {
    throw new Error("Invalid assignment version");
  }
  const assignment = await assignmentVersion.getAssignment();
  const submissions: Map<string, { file: File; buffer: Buffer }> = new Map();

  const course = await assignment.getCourse();

  // do all the heavy lifting before the transaction
  try {
    // read file and remove file
    const fileData = await fsPromises.readFile(file.path);
    await fsPromises.unlink(file.path);

    // can throw an error if corrupted
    const submissionRegex = /^[^\/]*?\/submissions\/.*/;
    const excludeFiles = [".DS_Store", "submission-link.url"]
    const files = await JSZip.loadAsync(fileData).then((zip) => {
      return Object.keys(zip.files)
        .map((name) => zip.file(name))
        .filter((f): f is JSZip.JSZipObject => !!f) // filter out null files
        .filter((f) => !f.dir) // filter out all files that are directories
        .filter((f) => submissionRegex.test(f.name)) // filter out non-submission files
        .filter((f) => !excludeFiles.includes(f.name.split("/").pop() ?? "")); // filter out excluded files
    });

    // create map with submissions files for each user
    const userRegex = /^[^\/]*?\/submissions\/(.*?)\//;
    const rawSubmissions: Map<string, Array<JSZip.JSZipObject>> = new Map();
    for (const file of files) {
      const userString = userRegex.exec(file.name);
      if (!userString) {
        continue;
      }
      const studentNumber = userString[1].substring(
        0,
        userString[1].indexOf("_")
      );
      const files = rawSubmissions.get(studentNumber) ?? [];
      files.push(file);
      rawSubmissions.set(studentNumber, files);
    }

    // create zip file with all submissions for each user
    const fileRegex = /^[^\/]*?\/submissions\/(.*)$/;
    for (const [studentNumber, files] of rawSubmissions) {
      // populate zip file
      const zip = new JSZip();
      for (const file of files) {
        const fileString = fileRegex.exec(file.name);
        if (!fileString) {
          continue;
        }
        zip.file(fileString[1], file.async("nodebuffer"));
      }

      // generate zip file
      const buffer = await zip.generateAsync({ type: "nodebuffer" });
      const fileName = `assignmentversion${assignmentVersion.id}_submission${studentNumber}`;
      const file = new File(fileName, ".zip", null);
      submissions.set(studentNumber, { file, buffer });
    }
  } catch (error) {
    throw new Error(error);
  }

  await getManager().transaction(
    "SERIALIZABLE", // serializable is the only way to make sure groups and submissions exist before import
    async (transactionalEntityManager) => {
      const existingGroups = await transactionalEntityManager
        .createQueryBuilder(Group, "group")
        .leftJoin("group.assignments", "assignment")
        .where("assignment.id = :id", { id: assignment.id })
        .getMany();
      if (existingGroups.length > 0) {
        throw new Error("There are already groups for this assignment");
      }

      const existingSubmissions = await transactionalEntityManager
        .createQueryBuilder(Submission, "submission")
        .where("submission.assignmentVersionId = :id", {
          id: assignmentVersionId,
        })
        .getMany();
      if (existingSubmissions.length > 0) {
        throw new Error("There are already submissions for this assignment");
      }

      for (const [studentNumber, { file, buffer }] of submissions) {
        // get user from directory names
        const user = await transactionalEntityManager.findOneOrFail(User, {
          studentNumber: parseInt(studentNumber),
        });

        // make the group
        const group = new Group(user.netid, course, [user], [assignment]);
        await group.validateOrReject();
        await transactionalEntityManager.save(group);

        // save file entry to database
        await file.validateOrReject();
        await transactionalEntityManager.save(file);

        // make the submission
        // the submission cannot be validated, because the group has not been saved
        const submission = new Submission(
          user,
          group,
          assignmentVersion,
          file,
          true
        );
        await transactionalEntityManager.save(submission);

        // write the file (so if this fails everything above fails)
        // new place where the file will be saved
        const filePath = path.resolve(uploadFolder, file.id.toString());
        // write
        await fsPromises.writeFile(filePath, buffer);
      }
    }
  );

  return `Submissions imported for assignmentVersion ${assignmentVersion.id}`;
};

export default importWebLabSubmissions;
