const { AbilityBuilder, createMongoAbility } = require('@casl/ability');
const { role: roleEnum } = require('./constant');

// define by role
const defineSuperAdminRules = ({ can }) => {
  can('manage', 'all');
};

const defineAnonymousRules = ({ can }) => {
  can('read', 'Course');
  can('read', 'Province');
  can('read', 'City');
};

// ROLE MEMBER
const defineAbilityForMemberRules = ({ can, cannot }, user) => {
  can('update', 'Member', { id: user.id });
  can(['read', 'register'], 'Course', { id: user.id });
  can('read', 'Module', { id: user.id });
  can('read', 'Certificate', { id: user.id });
  can('read', 'Instructor', { id: user.id });
  can(['read', 'create'], 'RegistrationPayment', { id: user.id });
  can(['read', 'create'], 'OperationalPayment', { id: user.id });
  can(['read', 'create', 'update'], ['Test', 'Score'], { id: user.id });
  can(['read', 'create', 'update'], ['Attendance', 'Presence'], {
    id: user.id,
  });

  cannot('read', 'User');
};

// ROLE DIRECTOR
const defineAbilityForDirectorRules = ({ can }, user) => {
  can('read', ['RegistrationPayment', 'OperationalPayment', 'Course', 'User'], {
    id: user.id,
  });
  can('read', 'Instructor', { id: user.id });
};

// ROLE ADMIN COURSE
const defineAbilityForAdminCourseRules = ({ can }, user) => {
  can('read', ['RegistrationPayment', 'OperationalPayment', 'Template'], {
    id: user.id,
  });
  can(
    ['read', 'create', 'update', 'delete'],
    ['User', 'Test', 'Score', 'Attendance', 'Presence'],
    { id: user.id },
  );
  can(['read', 'create'], 'Role', { id: user.id });
};

// ROLE INSTRUCTOR
const defineAbilityForInstructorRules = ({ can }, user) => {
  can('read', ['Course', 'Certificate', 'RegistrationPayment', 'Template'], {
    id: user.id,
  });
  can(['read', 'update'], 'Instructor', { id: user.id });
  can(['read', 'create', 'update', 'delete'], ['Test', 'Score'], {
    id: user.id,
  });
  can(['read', 'create', 'update', 'delete'], 'Attendance', {
    id: user.id,
  });
  can(['read', 'delete'], 'Presence', { id: user.id });
};

// ROLE TREASURER
const defineAbilityForTreasurerRules = ({ can }, user) => {
  can('read', ['Course', 'User'], { id: user.id });
};

// define by entities
const defineAbilityForCategoryEntity = ({ can }, user) => {
  can(['read', 'create', 'update', 'delete'], 'Category', { id: user.id });

  can('read', 'Course', { id: user.id });
};

const defineAbilityForInstructorEntity = ({ can }, user) => {
  can(['read', 'create', 'update', 'delete'], 'Instructor', { id: user.id });
};

const defineAbilityForCourseEntity = ({ can }, user) => {
  can(['read', 'create', 'update', 'delete'], 'Course', {
    id: user.id,
  });

  can('read', 'Category', { id: user.id });
};

const defineAbilityForModuleEntity = ({ can }, user) => {
  can(['read', 'create', 'delete'], 'Module', {
    id: user.id,
  });
};

const defineAbilityForCertificateEntity = ({ can }, user) => {
  can(['read', 'create', 'delete'], 'Certificate', {
    id: user.id,
  });
};

const defineAbilityForRegistrationPaymentEntity = ({ can }, user) => {
  can(['read', 'create', 'update', 'delete'], 'RegistrationPayment', {
    id: user.id,
  });
};

const defineAbilityForOperationalPaymentEntity = ({ can }, user) => {
  can(['read', 'create', 'update', 'delete'], 'OperationalPayment', {
    id: user.id,
  });
};

const defineAbilityForProvinceEntity = ({ can }, user) => {
  can('read', 'Province', { id: user.id });
};

const defineAbilityForCityEntity = ({ can }, user) => {
  can('read', 'City', { id: user.id });
};

const defineAbilityForReportEntity = ({ can }, user) => {
  can('read', 'Report', { id: user.id });
};

const defineAbilityForMemberEntity = ({ can }, user) => {
  can('read', 'Member', { id: user.id });
};

const defineAbilityForUserRules = ({ can }, user) => {
  can(['read', 'update'], 'User', { id: user.id });
};

const defineAbilityRules = (user) => {
  const builder = new AbilityBuilder(createMongoAbility);

  switch (user.roleId) {
    case roleEnum.SUPER_ADMIN.ID:
      defineSuperAdminRules(builder, user);
      break;
    case roleEnum.TREASURER.ID:
      defineAbilityForTreasurerRules(builder, user);
      defineAbilityForRegistrationPaymentEntity(builder, user);
      defineAbilityForOperationalPaymentEntity(builder, user);
      defineAbilityForProvinceEntity(builder, user);
      defineAbilityForCityEntity(builder, user);
      defineAbilityForReportEntity(builder, user);
      defineAbilityForMemberEntity(builder, user);
      break;
    case roleEnum.DIRECTOR.ID:
      defineAbilityForDirectorRules(builder, user);
      defineAbilityForProvinceEntity(builder, user);
      defineAbilityForCityEntity(builder, user);
      defineAbilityForReportEntity(builder, user);
      defineAbilityForMemberEntity(builder, user);
      break;
    case roleEnum.ADMIN_COURSE.ID:
      defineAbilityForCategoryEntity(builder, user);
      defineAbilityForCourseEntity(builder, user);
      defineAbilityForInstructorEntity(builder, user);
      defineAbilityForModuleEntity(builder, user);
      defineAbilityForCertificateEntity(builder, user);
      defineAbilityForAdminCourseRules(builder, user);
      defineAbilityForProvinceEntity(builder, user);
      defineAbilityForCityEntity(builder, user);
      defineAbilityForReportEntity(builder, user);
      defineAbilityForMemberEntity(builder, user);
      break;
    case roleEnum.MEMBER.ID:
      defineAbilityForUserRules(builder, user);
      defineAbilityForMemberRules(builder, user);
      defineAbilityForProvinceEntity(builder, user);
      defineAbilityForCityEntity(builder, user);
      defineAbilityForReportEntity(builder, user);
      defineAbilityForMemberEntity(builder, user);
      break;
    case roleEnum.INSTRUCTOR.ID:
      defineAbilityForUserRules(builder, user);
      defineAbilityForModuleEntity(builder, user);
      defineAbilityForInstructorRules(builder, user);
      defineAbilityForProvinceEntity(builder, user);
      defineAbilityForCityEntity(builder, user);
      defineAbilityForReportEntity(builder, user);
      defineAbilityForMemberEntity(builder, user);
      break;
    default:
      defineAnonymousRules(builder);
      break;
  }

  return builder.build();
};

let ANONYMOUS_ABILITY;

const defineAbility = (user) => {
  if (user) return defineAbilityRules(user);

  ANONYMOUS_ABILITY = ANONYMOUS_ABILITY || defineAbilityRules({});
  return ANONYMOUS_ABILITY;
};

module.exports = {
  defineAbility,
};
