module.exports = {
  role: {
    name: [
      'SUPER_ADMIN',
      'ADMIN_COURSE',
      'MEMBER',
      'STAFF_HRD',
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
    STAFF_HRD: {
      VALUE: 'STAFF_HRD',
      ID: 'role-4',
    },
    TREASURER: {
      VALUE: 'TREASURER',
      ID: 'role-5',
    },
    DIRECTOR: {
      VALUE: 'DIRECTOR',
      ID: 'role-6',
    },
    VICE_DIRECTOR: {
      VALUE: 'VICE_DIRECTOR',
      ID: 'role-7',
    },
    INSTRUCTOR: {
      VALUE: 'INSTRUCTOR',
      ID: 'role-8',
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
    type: [
      'MODULE',
      'CURRICULUM',
      'CERTIFICATE_MEMBER',
      'CERTIFICATE_INSTRUCTOR',
    ],
  },
  certificate: {
    type: ['CERTIFICATE_MEMBER', 'CERTIFICATE_INSTRUCTOR'],
  },
  payment: {
    method: ['BANK_TRANSFER', 'CASH'],
    status: ['PENDING', 'SUCCESS', 'FAILED'],
  },
  employee: {
    gender: ['MALE', 'FEMALE'],
  },
};
