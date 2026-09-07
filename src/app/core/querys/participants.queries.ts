import { gql } from 'apollo-angular';
import { DocumentNode } from 'graphql';
export const GET_PARTICIPANTS: DocumentNode = gql`
  query participantDetails($procurementProcessId: String!) {
    participantDetails(procurementProcessId: $procurementProcessId) {
      biddingProcessBidderId
      procurementProcessId
      weighedTechScore
      weighedFinancialScore
      totalScore
      amount
      result
      bidder {
        id
        name
        type
        gender
        nationality
        legalRepresentative
        economicSector
        beneficiaryOwner
        isSme
        address
        zipCode
      }
    }
  }
`;

export const REMOVE_PARTICIPANT: DocumentNode = gql`
  mutation removeParticipant(
    $biddingProcessBidderId: String!
    $procurementProcessId: String!
  ) {
    removeParticipant(
      biddingProcessBidderId: $biddingProcessBidderId
      procurementProcessId: $procurementProcessId
    )
  }
`;

export const ADD_PARTICIPANT: DocumentNode = gql`
  mutation addParticipant(
    $participant: ParticipantSchemaInput!
    $countryCode: String!
  ) {
    addParticipant(participant: $participant, countryCode: $countryCode)
  }
`;
