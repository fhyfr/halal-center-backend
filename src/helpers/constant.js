module.exports = {
  role: {
    name: [
      'SUPER_ADMIN',
      'ADMIN_COURSE',
      'MEMBER',
      'TREASURER',
      'DIRECTOR',
      'VICE_DIRECTOR',
      'INSTRUCTOR',
    ],
    SUPER_ADMIN: {
      VALUE: 'SUPER_ADMIN',
      ID: 'role-1',
    },
    ADMIN_COURSE: {
      VALUE: 'ADMIN_COURSE',
      ID: 'role-2',
    },
    MEMBER: {
      VALUE: 'MEMBER',
      ID: 'role-3',
    },
    TREASURER: {
      VALUE: 'TREASURER',
      ID: 'role-4',
    },
    DIRECTOR: {
      VALUE: 'DIRECTOR',
      ID: 'role-5',
    },
    VICE_DIRECTOR: {
      VALUE: 'VICE_DIRECTOR',
      ID: 'role-6',
    },
    INSTRUCTOR: {
      VALUE: 'INSTRUCTOR',
      ID: 'role-7',
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
    type: ['MODULE', 'CERTIFICATE_MEMBER', 'CERTIFICATE_INSTRUCTOR'],
  },
  certificate: {
    type: ['CERTIFICATE_MEMBER', 'CERTIFICATE_INSTRUCTOR'],
  },
  payment: {
    method: ['BANK_TRANSFER', 'CASH'],
    status: ['PENDING', 'SUCCESS', 'FAILED'],
  },
};
