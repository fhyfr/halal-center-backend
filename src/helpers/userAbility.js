/* eslint-disable import/no-extraneous-dependencies */
const { AbilityBuilder, createMongoAbility } = require('@casl/ability');
const { role: roleEnum } = require('./constant');

const defineAdminRules = ({ can }) => {
  can('manage', 'all');
};

const defineAnonymousRules = ({ can }) => {
  can('read', ['Community', 'Thread', 'Comment']);
};

const defineAbilityForThreadAndComment = ({ can, cannot }, user) => {
  can(['update', 'delete'], ['Thread', 'Comment'], { userCreateId: user.id });

  can('create', ['Thread', 'Comment'], { isMember: true });

  cannot(['update', 'delete'], ['Thread', 'Comment'], { isModerator: false });
};

const defineAbilityForUser = ({ can }, user) => {
  can(['read', 'update'], 'User', { id: user.id });
};

const defineAbilityForMember = ({ can }) => {
  can(['create', 'delete'], 'Member');
};

const defineAbilityForVote = ({ can }) => {
  can('create', 'Vote');
};

const defineAbilityForReport = ({ can }) => {
  can('create', 'Report');
};

const defineAbilityRules = (user) => {
  const builder = new AbilityBuilder(createMongoAbility);

  switch (user.roleId) {
    case roleEnum.USER.ID:
      defineAbilityForThreadAndComment(builder, user);
      defineAbilityForUser(builder, user);
      defineAbilityForMember(builder);
      defineAbilityForVote(builder);
      defineAbilityForReport(builder);
      break;
    case roleEnum.SUPER_ADMIN.ID:
      defineAdminRules(builder);
      break;
    default:
      defineAnonymousRules(builder);
      break;
  }

  return builder.rules;
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
