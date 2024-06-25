import { GraphQLObjectType, GraphQLInt } from 'graphql';

import { userType } from './user.type';
import { tokenType } from './token.type';

export const authType = new GraphQLObjectType({
  name: 'Auth',
  fields: {
    user: { type: userType },
    token: { type: tokenType },
  },
});


