/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const { ForbiddenError } = require('@casl/ability');
const uploadTemplates = require('../helpers/uploadTemplates');
const NotFoundError = require('../exceptions/notFoundError');
const { course: courseMessage } = require('../helpers/responseMessage');

class TemplateUsecase {
  constructor(
    excelJS,
    courseRepo,
    registrationRepo,
    memberRepo,
    userRepo,
    mentorRepo,
    instructorRepo,
  ) {
    this.excelJS = excelJS;
    this.courseRepo = courseRepo;
    this.registrationRepo = registrationRepo;
    this.memberRepo = memberRepo;
    this.userRepo = userRepo;
    this.mentorRepo = mentorRepo;
    this.instructorRepo = instructorRepo;
  }

  async getCertificateTemplateByCourseId(ability, courseId) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Template');

    const workbook = new this.excelJS.Workbook();
    const worksheet = workbook.addWorksheet('Certificates');
    let rowNumber = 0;

    // validate course existence
    const course = await this.courseRepo.findById(courseId);
    if (course === null) {
      throw new NotFoundError(courseMessage.notFound);
    }

    // Define columns in the worksheet
    worksheet.columns = uploadTemplates.certificates;

    // get all participants of the course and assign the data to the worksheet
    const participants = await this.registrationRepo.findParticipantsByCourseId(
      courseId,
    );
    if (participants.length === 0) {
      return workbook;
    }

    // looping the participants and find user data for each participant
    for (const participant of participants) {
      rowNumber += 1;

      const member = await this.memberRepo.findByUserId(participant.userId);
      if (member === null) {
        return;
      }

      const user = await this.userRepo.findById(participant.userId);
      if (user === null) {
        return;
      }

      worksheet.addRow({
        number: rowNumber,
        type: 'CERTIFICATE_MEMBER',
        courseId,
        userId: participant.userId,
        fullName: member.fullName,
        email: user.email,
      });
    }

    // get all instructors of the course and assign the data to the worksheet
    const instructors = await this.mentorRepo.findAllByCourseId(courseId);
    if (instructors.length === 0) {
      return workbook;
    }

    // looping the instructors and find user data for each instructor
    for (const instructorId of instructors.rows) {
      rowNumber += 1;

      const instructor = await this.instructorRepo.findById(instructorId);
      if (instructor === null) {
        return;
      }

      const user = await this.userRepo.findById(instructor.userId);
      if (user === null) {
        return;
      }

      worksheet.addRow({
        number: rowNumber,
        type: 'CERTIFICATE_INSTRUCTOR',
        courseId,
        userId: instructor.userId,
        fullName: instructor.fullName,
        email: user.email,
      });
    }

    return workbook;
  }
}

module.exports = TemplateUsecase;
