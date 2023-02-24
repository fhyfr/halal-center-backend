const { AbilityBuilder, createMongoAbility } = require('@casl/ability');
const { role: roleEnum } = require('./constant');

const defineAdminRules = ({ can, cannot }) => {
  can('manage', 'all');

  cannot('update', 'Member');
};

const defineAnonymousRules = ({ can }) => {
  can('read', 'Course');
};

const defineAbilityForMember = ({ can, cannot }, user) => {
  can('update', 'Member', { id: user.id });
  can(['read', 'register'], 'Course', { id: user.id });
  can('read', 'Document', { id: user.id });

  cannot('read', 'User');
};

const defineAbilityForCategory = ({ can }, user) => {
  can(['read', 'create', 'update', 'delete'], 'Category', { id: user.id });
};

const defineAbilityForUser = ({ can }, user) => {
  can(['read', 'update'], 'User', { id: user.id });
};

const defineAbilityForInstructor = ({ can }, user) => {
  can(['read', 'create', 'update', 'delete'], 'Instructor', { id: user.id });
};

const defineAbilityForPositionAndDepartmentAndEmployee = ({ can }, user) => {
  can(
    ['read', 'create', 'update', 'delete'],
    ['Category', 'Department', 'Employee'],
    {
      id: user.id,
    },
  );
};

const defineAbilityForCourse = ({ can }, user) => {
  can(['read', 'create', 'update', 'delete', 'register'], 'Course', {
    id: user.id,
  });
};

const defineAbilityForDocument = ({ can }, user) => {
  can(['read', 'create', 'delete'], 'Document', {
    id: user.id,
  });
};

const defineAbilityForPromotion = ({ can }, user) => {
  can(['read', 'create', 'resend', 'delete'], 'Promotion', { id: user.id });
};

const defineAbilityForPayment = ({ can }, user) => {
  can(['read', 'create', 'delete'], 'Payment', { id: user.id });
};

const defineAbilityRules = (user) => {
  const builder = new AbilityBuilder(createMongoAbility);

  switch (user.roleId) {
    case roleEnum.MEMBER.ID:
      defineAbilityForUser(builder, user);
      defineAbilityForMember(builder, user);
      break;
    case roleEnum.SUPER_ADMIN.ID:
      defineAdminRules(builder);
      break;
    case roleEnum.ADMIN_COURSE.ID:
      defineAbilityForCategory(builder, user);
      defineAbilityForCourse(builder, user);
      defineAbilityForInstructor(builder, user);
      defineAbilityForDocument(builder, user);
      defineAbilityForPromotion(builder, user);
      break;
    case roleEnum.VICE_DIRECTOR.ID:
      defineAbilityForCategory(builder, user);
      defineAbilityForInstructor(builder, user);
      defineAbilityForDocument(builder, user);
      break;
    case roleEnum.STAFF_HRD.ID:
      defineAbilityForPositionAndDepartmentAndEmployee(builder, user);
      break;
    case roleEnum.TREASURER.ID:
      defineAbilityForPromotion(builder, user);
      defineAbilityForPayment(builder, user);
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
