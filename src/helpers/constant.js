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
    ],
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
