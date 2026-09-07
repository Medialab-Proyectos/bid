import { gql } from 'apollo-angular';
import { DocumentNode } from 'graphql';

export const GET_TRANSLATIONS: DocumentNode = gql`
  query translates($language: String!, $prefix: String!, $sources: [String!]!) {
    translates(language: $language, prefix: $prefix, sources: $sources) {
      translate
      sysLocaleSources {
        source
      }
    }
  }
`;
