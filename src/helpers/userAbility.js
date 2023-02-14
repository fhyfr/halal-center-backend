/* eslint-disable import/no-extraneous-dependencies */
const { AbilityBuilder, createMongoAbility } = require('@casl/ability');
const { role: roleEnum } = require('./constant');

const defineAdminRules = ({ can, cannot }) => {
  can('manage', 'all');

  cannot('update', 'Member');
};

const defineAnonymousRules = ({ can }) => {
  can('read', ['Community', 'Thread', 'Comment']);
};

const defineAbilityForMember = ({ can }, user) => {
  can('update', 'Member', { id: user.id });
};

const defineAbilityForCategory = ({ can }, user) => {
  can(['findById', 'create', 'update', 'delete'], 'Category', { id: user.id });
};

const defineAbilityForUser = ({ can }, user) => {
  can(['read', 'update'], 'User', { id: user.id });
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
      break;
    case roleEnum.VICE_DIRECTOR.ID:
      defineAbilityForCategory(builder, user);
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
