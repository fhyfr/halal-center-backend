/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
const { ForbiddenError } = require('@casl/ability');
const { getPagination, getPagingData } = require('../helpers/pagination');
const logger = require('../helpers/logger');
const { course: courseMessage } = require('../helpers/responseMessage');
const NotFoundError = require('../exceptions/notFoundError');
const { getAge } = require('../helpers/dateConverter');
const {
  getAgeVectorS,
  getEducationVectorS,
  getAttendanceVectorS,
  getScoreVectorS,
  getExperienceVectorS,
  getResultOfSi,
  getResultOfVi,
} = require('../helpers/weightedProduct');

class ReportUsecase {
  constructor(
    courseRepo,
    userRepo,
    categoryRepo,
    registrationRepo,
    attendanceRepo,
    presenceRepo,
    scoreRepo,
    memberRepo,
  ) {
    this.courseRepo = courseRepo;
    this.userRepo = userRepo;
    this.categoryRepo = categoryRepo;
    this.registrationRepo = registrationRepo;
    this.attendanceRepo = attendanceRepo;
    this.presenceRepo = presenceRepo;
    this.scoreRepo = scoreRepo;
    this.memberRepo = memberRepo;
  }

  async findDashboardReport(ability) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Report');

    const totalCourses = await this.courseRepo.countTotalCourses();
    const totalSuccessCourses =
      await this.courseRepo.countTotalSuccessCourses();
    const totalMembers = await this.userRepo.countTotalMembers();
    const totalInstructors = await this.userRepo.countTotalInstructors();

    return {
      totalCourses,
      totalSuccessCourses,
      totalMembers,
      totalInstructors,
    };
  }

  async findCoursesReport(req) {
    ForbiddenError.from(req.ability).throwUnlessCan('read', 'Report');

    const { page, size, courseId } = req.query;
    const { limit, offset } = getPagination(page, size);

    const ids = await this.courseRepo.findAllCoursesForReport(
      offset,
      limit,
      courseId,
    );
    const dataRows = {
      count: ids.count,
      rows: await this.resolveReportCourses(ids.rows),
    };

    return getPagingData(dataRows, page, limit);
  }

  async findCourseReportByCourseId(ability, id) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Report');

    const course = await this.courseRepo.findById(id);
    if (course === null) {
      throw new NotFoundError(courseMessage.notFound);
    }

    return this.resolveReportCourseData(course);
  }

  async findCourseRankReportByCourseId(ability, courseId) {
    ForbiddenError.from(ability).throwUnlessCan('read', 'Report');

    const participantSVectors = [];

    const course = await this.courseRepo.findById(courseId);
    if (course === null) {
      throw new NotFoundError(courseMessage.notFound);
    }

    // find participants of the course
    const participants = await this.registrationRepo.findParticipantsByCourseId(
      courseId,
    );
    if (participants === null) {
      return participantSVectors;
    }

    const totalAttendances =
      await this.attendanceRepo.countTotalAttendancesByCourseId(courseId);

    // looping participants and find user data for each participant
    // eslint-disable-next-line no-restricted-syntax
    for (const participant of participants) {
      const userData = await this.userRepo.findById(participant.userId);
      if (userData === null) {
        continue;
      }

      const member = await this.memberRepo.findByUserId(userData.id);
      if (member === null) {
        continue;
      }

      Object.assign(userData, { member });

      // count rank for every participant
      // count criteria education
      const age = getAge(userData.member.dateOfBirth);
      const vectorSAge = getAgeVectorS(age);

      // count criteria education
      const vectorSEducation = getEducationVectorS(userData.member.education);

      // count criteria attendance
      const totalParticipantPresences =
        await this.presenceRepo.countTotalPresenceByRegistrationId(
          participant.id,
        );
      const vectorSAttendance = getAttendanceVectorS(
        totalParticipantPresences,
        totalAttendances,
      );

      // count criteria score
      const averageScoreOfParticipant =
        await this.scoreRepo.findAverageScoreByCourseIdAndRegistrationId(
          courseId,
          participant.id,
        );

      const vectorSScore = getScoreVectorS(
        averageScoreOfParticipant.average_score,
      );

      // count criteria experience
      const vectorSExperience = getExperienceVectorS(
        userData.member.workExperience,
      );

      // get result of Si
      const resultOfSi = getResultOfSi(
        vectorSAge,
        vectorSEducation,
        vectorSAttendance,
        vectorSScore,
        vectorSExperience,
      );

      participantSVectors.push({
        userId: userData.id,
        fullName: userData.member.fullName,
        vectorSAge,
        vectorSEducation,
        vectorSAttendance,
        vectorSScore,
        vectorSExperience,
        resultOfSi,
      });
    }

    // count total result of Si
    let totalResultOfSi = 0;
    participantSVectors.forEach((participant) => {
      totalResultOfSi += participant.resultOfSi;
    });

    // count result of Vi
    participantSVectors.forEach((participant) => {
      Object.assign(participant, {
        totalResultOfSi,
        resultOfVi: getResultOfVi(participant.resultOfSi, totalResultOfSi),
      });
    });

    if (participantSVectors.length === 0) {
      return participantSVectors;
    }

    // sort the rank array by highest rank
    participantSVectors.sort((a, b) => b.resultOfVi - a.resultOfVi);

    // assign user data and rank for each participants and sorting by highest rank
    return participantSVectors;
  }

  async resolveReportCourses(ids, userId) {
    const courses = [];

    await ids.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      const course = await this.courseRepo.findById(nextID);

      if (course == null) {
        logger.error(`${courseMessage.null} ${nextID}`);
      } else if (userId && userId > 0) {
        courses.push(await this.resolveReportCourseData(course, userId));
      } else {
        courses.push(await this.resolveReportCourseData(course));
      }
    }, Promise.resolve());

    return courses;
  }

  async resolveReportCourseData(course) {
    const { deletedAt, deletedBy, ...courseData } = course;

    const courseCategory = await this.categoryRepo.findById(
      courseData.categoryId,
    );

    if (courseCategory !== null) {
      delete courseCategory.deletedBy;
      delete courseCategory.deletedAt;

      Object.assign(courseData, {
        category: courseCategory,
      });
    }

    const totalParticipants =
      await this.courseRepo.countTotalParticipantsByCourseId(courseData.id);
    const totalInstructors =
      await this.courseRepo.countTotalInstructorsByCourseId(courseData.id);

    Object.assign(courseData, {
      totalParticipants,
      totalInstructors,
    });

    return courseData;
  }
}

module.exports = ReportUsecase;
