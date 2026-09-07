import { gql } from 'apollo-angular';
import { DocumentNode } from 'graphql';
export const GET_ROLES: DocumentNode = gql`
  query rolesByUser($applicationCode: String!, $mail: String!) {
    rolesByUser(applicationCode: $applicationCode, mail: $mail) {
      id
      code
      name
      permissions {
        id
        code
        name
      }
    }
  }
`;
