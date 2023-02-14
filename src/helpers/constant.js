module.exports = {
  role: {
    name: [
      'SUPER_ADMIN',
      'ADMIN_COURSE',
      'MEMBER',
      'INSTRUCTOR',
      'EMPLOYEE',
      'SECRETARY',
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
    INSTRUCTOR: {
      VALUE: 'INSTRUCTOR',
      ID: 4,
    },
    EMPLOYEE: {
      VALUE: 'EMPLOYEE',
      ID: 5,
    },
    SECRETARY: {
      VALUE: 'SECRETARY',
      ID: 6,
    },
    TREASURER: {
      VALUE: 'TREASURER',
      ID: 7,
    },
    DIRECTOR: {
      VALUE: 'DIRECTOR',
      ID: 8,
    },
    VICE_DIRECTOR: {
      VALUE: 'VICE_DIRECTOR',
      ID: 9,
    },
  },
  course: {
    type: ['FREE', 'PAID'],
    level: ['BEGINNER', 'INTERMEDIATE', 'ADVANCE'],
  },
  promotion: {
    type: ['BROADCAST', 'SPESIFIC_USER'],
  },
  module: {
    type: ['MODULE', 'CURRICULUM'],
  },
};
