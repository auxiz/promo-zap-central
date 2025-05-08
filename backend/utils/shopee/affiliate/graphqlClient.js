
/**
 * Re-export the GraphQL client from the auth module
 */
const { makeGraphQLRequest } = require('../auth/graphqlClient');

module.exports = {
  makeGraphQLRequest
};
