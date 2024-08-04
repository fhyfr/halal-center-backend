module.exports = {
  role: {
    name: [
      'SUPER_ADMIN',
      'ADMIN_COURSE',
      'MEMBER',
      'TREASURER',
      'DIRECTOR',
      'INSTRUCTOR',
    ],
    SUPER_ADMIN: {
      VALUE: 'SUPER_ADMIN',
      ID: 1,
    },
    ADMIN_COURSE: {
      VALUE: 'ADMIN_COURSE',
      ID: 2,
    },
    MEMBER: {
      VALUE: 'MEMBER',
      ID: 3,
    },
    TREASURER: {
      VALUE: 'TREASURER',
      ID: 4,
    },
    DIRECTOR: {
      VALUE: 'DIRECTOR',
      ID: 5,
    },
    INSTRUCTOR: {
      VALUE: 'INSTRUCTOR',
      ID: 6,
    },
  },
  course: {
    type: ['FREE', 'PAID'],
    level: ['BEGINNER', 'INTERMEDIATE', 'ADVANCE'],
  },
  upload: {
    type: {
      IMAGE: 'IMAGE',
      DOCUMENT: 'DOCUMENT',
    },
  },
  document: {
    type: ['MODULE', 'CERTIFICATE'],
  },
  payment: {
    type: ['REGISTRATION', 'COURSE_UTILITIES'],
    method: ['BANK_TRANSFER', 'CASH'],
    status: ['PENDING', 'SUCCESS', 'FAILED'],
  },
  employee: {
    gender: ['MALE', 'FEMALE'],
  },
  certificate: {
    type: ['CERTIFICATE_MEMBER', 'CERTIFICATE_INSTRUCTOR'],
  },
  test: {
    type: ['PRE_TEST', 'POST_TEST'],
  },
  criteriaWeight: {
    age: 15,
    education: 15,
    attendance: 20,
    score: 20,
    experience: 30,
    total: 100,
  },
};
