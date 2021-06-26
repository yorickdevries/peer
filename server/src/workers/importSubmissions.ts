import { getManager } from "typeorm";
import UserRole from "../enum/UserRole";
import AssignmentVersion from "../models/AssignmentVersion";
import Course from "../models/Course";
import Enrollment from "../models/Enrollment";
import ensureConnection from "../util/ensureConnection";
import Group from "../models/Group";
import Submission from "../models/Submission";
import fsPromises from "fs/promises";
import JSZip from "jszip";
import User from "../models/User";
import File from "../models/File";
import config from "config";
import path from "path";
import { sendMailToTeachersOfAssignment } from "../util/mailer";

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
  // this should realistically never happen
  if (!assignmentVersion) {
    throw new Error("Invalid assignment version");
  }
  const assignment = await assignmentVersion.getAssignment();
  const submissions: Map<string, { file: File; buffer: Buffer }> = new Map();
  const names: Map<string, string> = new Map();
  const invalidSubmissions: Array<string> = [];

  // do all the heavy lifting before the transaction
  try {
    // read file and remove file
    const fileData = await fsPromises.readFile(file.path);
    await fsPromises.unlink(file.path);

    // can throw an error if corrupted
    const submissionRegex = /^[^/]*?\/submissions\/.*/;
    const excludeFiles = [".DS_Store", "submission-link.url"];
    const files = await JSZip.loadAsync(fileData).then((zip) => {
      return Object.keys(zip.files)
        .map((name) => zip.file(name))
        .filter((f): f is JSZip.JSZipObject => !!f) // filter out null files
        .filter((f) => !f.dir) // filter out all files that are directories
        .filter((f) => submissionRegex.test(f.name)) // filter out non-submission files
        .filter((f) => !excludeFiles.includes(f.name.split("/").pop() ?? "")); // filter out excluded files
    });

    // create map with submissions files for each user
    const userRegex = /^[^/]*?\/submissions\/(.*?)\//;
    const rawSubmissions: Map<string, Array<JSZip.JSZipObject>> = new Map();
    for (const file of files) {
      const userString = userRegex.exec(file.name);
      if (!userString || !userString[1]) {
        invalidSubmissions.push(file.name);
        continue;
      }
      const info = userString[1].split("_");
      const studentNumber = info.shift();
      if (!studentNumber) {
        invalidSubmissions.push(file.name);
        continue;
      }
      names.set(studentNumber, info.join(" "));
      const files = rawSubmissions.get(studentNumber) ?? [];
      files.push(file);
      rawSubmissions.set(studentNumber, files);
    }

    // create zip file with all submissions for each user
    const fileRegex = /^[^/]*?\/submissions\/.*?\/(.*)$/;
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
    await sendMailToTeachersOfAssignment(
      "Error while importing submissions from WebLab",
      `The imported zip file is invalid and no submissions were imported, error message:\n${error}`,
      assignment
    );
  }

  const skippedStudents: Array<string> = [];
  // Enroll students in in the course
  await getManager().transaction(
    "REPEATABLE READ", // make sure the role isnt changed while importing
    async (transactionalEntityManager) => {
      // groups and submissions should only rarely exist if groups or submissions were created during the processing of the zip file
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

      const course = await transactionalEntityManager.findOneOrFail(
        Course,
        assignment.courseId
      );

      for (const studentNumber of submissions.keys()) {
        // get user from directory names
        const user = await transactionalEntityManager.findOne(User, {
          studentNumber: parseInt(studentNumber),
        });

        // skip the user if they do not exist in the database
        if (!user) {
          skippedStudents.push(studentNumber);
          // remove non-existing students to make group and submission import easier
          submissions.delete(studentNumber);
          continue;
        }

        // enroll user in the course if not already
        let enrollment = await transactionalEntityManager.findOne(Enrollment, {
          where: { userNetid: user.netid, courseId: course.id },
        });

        if (enrollment) {
          if (enrollment.role !== UserRole.STUDENT) {
            throw new Error(
              `${user.netid} is ${enrollment.role} in this course`
            );
          }
        } else {
          // enroll the user as student in the course
          enrollment = new Enrollment(user, course, UserRole.STUDENT);
          await enrollment.validateOrReject();
          await transactionalEntityManager.save(enrollment);
        }
      }
    }
  );

  await getManager().transaction(
    "SERIALIZABLE", // serializable is the only way to make sure groups and submissions exist before import
    async (transactionalEntityManager) => {
      const course = await transactionalEntityManager.findOneOrFail(
        Course,
        assignment.courseId
      );

      for (const [studentNumber, { file, buffer }] of submissions) {
        // get user from directory names
        const user = await transactionalEntityManager.findOne(User, {
          studentNumber: parseInt(studentNumber),
        });

        // skip the user if they do not exist in the database
        if (!user) {
          skippedStudents.push(studentNumber);
          continue;
        }

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

  const errors: Array<string> = [];
  if (invalidSubmissions.length > 0) {
    errors.push(
      `The following submission folders were invalid:\n` +
        `${invalidSubmissions.join("\n")}`
    );
  }
  if (skippedStudents.length > 0) {
    errors.push(
      `The following students were not in the database:\n` +
        `${skippedStudents.map((s) => `${names.get(s)} (${s})`).join("\n")}`
    );
  }

  if (errors.length > 0) {
    await sendMailToTeachersOfAssignment(
      "Warning while importing submissions from WebLab",
      `The submissions were imported from WebLab, however the following errors occurred.\n` +
        `${errors.join("\n\n")}`,
      assignment
    );
  }

  return `Submissions imported for assignmentVersion ${assignmentVersion.id}`;
};

export default importWebLabSubmissions;
