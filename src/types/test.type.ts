import { GraphQLID, GraphQLObjectType, GraphQLString } from 'graphql';

export const TestType = new GraphQLObjectType({
  name: 'Test',
  fields: {
    id: { type: GraphQLID },
    title: { type: GraphQLString },
  },
});
