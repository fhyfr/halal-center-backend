const { criteriaWeight } = require('./constant');

// Vektor S is exponential of the criteria value with the weight (normalized) of the criteria
const getAgeVectorS = (age) => {
  // The weight for Cost criteria is negative
  // because the lower the cost, the better.
  const ageWeight = -(criteriaWeight.age / criteriaWeight.total);

  let criteriaValue = 0;
  switch (true) {
    case age < 30:
      criteriaValue = 1;
      break;
    case age >= 30 && age <= 40:
      criteriaValue = 2;
      break;
    case age > 40:
      criteriaValue = 3;
      break;
    default:
      criteriaValue = 0;
      break;
  }

  // (**) operation is for exponential calculation
  return criteriaValue ** ageWeight;
};

const getEducationVectorS = (education) => {
  // Education criteria is positive because the higher the education, the better.
  const educationWeight = criteriaWeight.education / criteriaWeight.total;

  let criteriaValue = 0;
  switch (true) {
    case education === 'SLTA':
      criteriaValue = 1;
      break;
    case education === 'D1' || education === 'D2' || education === 'D3':
      criteriaValue = 2;
      break;
    case education === 'S1_OR_D4':
      criteriaValue = 3;
      break;
    case education === 'S2':
      criteriaValue = 4;
      break;
    case education === 'S3':
      criteriaValue = 5;
      break;
    default:
      criteriaValue = 0;
      break;
  }

  return criteriaValue ** educationWeight;
};

const getAttendanceVectorS = (totalPresence, totalAttendance) => {
  // Attendance criteria is positive because the higher the attendance, the better.
  const attendanceWeight = criteriaWeight.attendance / criteriaWeight.total;
  const criteriaValue = totalPresence / totalAttendance;

  return criteriaValue ** attendanceWeight;
};

const getScoreVectorS = (score) => {
  if (score === null || score === undefined) {
    return 0;
  }
  // Score criteria is positive because the higher the score, the better.
  const scoreWeight = criteriaWeight.score / criteriaWeight.total;

  return score ** scoreWeight;
};

const getExperienceVectorS = (duration) => {
  // Experience criteria is positive because the higher the experience, the better.
  const experienceWeight = criteriaWeight.experience / criteriaWeight.total;

  let criteriaValue = 0;
  switch (true) {
    case duration < 1:
      criteriaValue = 1;
      break;
    case duration >= 1 && duration <= 3:
      criteriaValue = 2;
      break;
    case duration >= 4 && duration <= 7:
      criteriaValue = 3;
      break;
    case duration > 7:
      criteriaValue = 4;
      break;
    default:
      criteriaValue = 0;
      break;
  }

  return criteriaValue ** experienceWeight;
};

// Result of Si is the multiplication of all Vector S
const getResultOfSi = (c1, c2, c3, c4, c5) => c1 * c2 * c3 * c4 * c5;

// Result of Vi is the division of Result of Si with the total Result of Si
const getResultOfVi = (resultOfSi, totalResultOfSi) => {
  if (resultOfSi === null || totalResultOfSi === null) {
    return 0;
  }

  if (resultOfSi === 0 || totalResultOfSi === 0) {
    return 0;
  }

  return resultOfSi / totalResultOfSi;
};
module.exports = {
  getAgeVectorS,
  getEducationVectorS,
  getAttendanceVectorS,
  getScoreVectorS,
  getExperienceVectorS,
  getResultOfSi,
  getResultOfVi,
};
