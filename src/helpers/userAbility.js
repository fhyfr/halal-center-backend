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

const defineAbilityForMember = ({ can, cannot }, user) => {
  can('update', 'Member', { id: user.id });
  can(['read', 'register'], 'Course', { id: user.id });
  can('read', 'Module', { id: user.id });
  can('read', 'Certificate', { id: user.id });
  can('read', 'Instructor', { id: user.id });
  can(['read', 'create'], 'RegistrationPayment', { id: user.id });
  can(['read', 'create'], 'OperationalPayment', { id: user.id });

  cannot('read', 'User');
};

const defineAbilityForUser = ({ can }, user) => {
  can(['read', 'update'], 'User', { id: user.id });
};

const defineAbilityForDirector = ({ can }, user) => {
  can('read', ['RegistrationPayment', 'OperationalPayment', 'Course'], {
    id: user.id,
  });
};

const defineAbilityForAdminCourse = ({ can }, user) => {
  can('read', ['RegistrationPayment', 'OperationalPayment'], { id: user.id });
};

const defineAbilityForInstructorUser = ({ can }, user) => {
  can('read', ['Course', 'Certificate'], { id: user.id });
};

// define by entities
const defineAbilityForCategory = ({ can }, user) => {
  can(['read', 'create', 'update', 'delete'], 'Category', { id: user.id });

  can('read', 'Course', { id: user.id });
};

const defineAbilityForInstructor = ({ can }, user) => {
  can(['read', 'create', 'update', 'delete'], 'Instructor', { id: user.id });
};

const defineAbilityForCourse = ({ can }, user) => {
  can(['read', 'create', 'update', 'delete'], 'Course', {
    id: user.id,
  });

  can('read', 'Category', { id: user.id });
};

const defineAbilityForModule = ({ can }, user) => {
  can(['read', 'create', 'delete'], 'Module', {
    id: user.id,
  });
};

const defineAbilityForCertificate = ({ can }, user) => {
  can(['read', 'create', 'delete'], 'Certificate', {
    id: user.id,
  });
};

const defineAbilityForRegistrationPayment = ({ can }, user) => {
  can(['read', 'create', 'update', 'delete'], 'RegistrationPayment', {
    id: user.id,
  });
};

const defineAbilityForOperationalPayment = ({ can }, user) => {
  can(['read', 'create', 'update', 'delete'], 'OperationalPayment', {
    id: user.id,
  });
};

const defineAbilityForProvince = ({ can }, user) => {
  can('read', 'Province', { id: user.id });
};

const defineAbilityForCity = ({ can }, user) => {
  can('read', 'City', { id: user.id });
};

const defineAbilityRules = (user) => {
  const builder = new AbilityBuilder(createMongoAbility);

  switch (user.roleId) {
    case roleEnum.SUPER_ADMIN.ID:
      defineSuperAdminRules(builder, user);
      break;
    case roleEnum.TREASURER.ID:
      defineAbilityForRegistrationPayment(builder, user);
      defineAbilityForOperationalPayment(builder, user);
      defineAbilityForProvince(builder, user);
      defineAbilityForCity(builder, user);
      break;
    case roleEnum.DIRECTOR.ID:
      defineAbilityForDirector(builder, user);
      defineAbilityForProvince(builder, user);
      defineAbilityForCity(builder, user);
      break;
    case roleEnum.VICE_DIRECTOR.ID:
      defineAbilityForCategory(builder, user);
      defineAbilityForInstructor(builder, user);
      defineAbilityForModule(builder, user);
      defineAbilityForCertificate(builder, user);
      defineAbilityForProvince(builder, user);
      defineAbilityForCity(builder, user);
      break;
    case roleEnum.ADMIN_COURSE.ID:
      defineAbilityForCategory(builder, user);
      defineAbilityForCourse(builder, user);
      defineAbilityForInstructor(builder, user);
      defineAbilityForModule(builder, user);
      defineAbilityForCertificate(builder, user);
      defineAbilityForAdminCourse(builder, user);
      defineAbilityForProvince(builder, user);
      defineAbilityForCity(builder, user);
      break;
    case roleEnum.MEMBER.ID:
      defineAbilityForUser(builder, user);
      defineAbilityForMember(builder, user);
      defineAbilityForProvince(builder, user);
      defineAbilityForCity(builder, user);
      break;
    case roleEnum.INSTRUCTOR.ID:
      defineAbilityForModule(builder, user);
      defineAbilityForInstructorUser(builder, user);
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
