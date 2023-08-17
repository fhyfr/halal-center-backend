module.exports = {
  role: {
    name: [
      'SUPER_ADMIN',
      'ADMIN_COURSE',
      'MEMBER',
      'TREASURER',
      'DIRECTOR',
      'VICE_DIRECTOR',
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
    VICE_DIRECTOR: {
      VALUE: 'VICE_DIRECTOR',
      ID: 6,
    },
  },
  course: {
    type: ['FREE', 'PAID'],
    level: ['BEGINNER', 'INTERMEDIATE', 'ADVANCE'],
  },
  promotion: {
    type: ['SPESIFIC_USER'],
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
};
