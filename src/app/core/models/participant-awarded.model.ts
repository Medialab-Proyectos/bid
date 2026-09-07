export interface ParticipantAwarded {
  biddingProcessBidderId: string;
  biddingProcessParticipantId: string;
  name: string;

  /**
   * @fromEnum countries
   */
  nationality: string;
}

export interface ParticipantAwardedAndWinner extends ParticipantAwarded {
  checked: boolean;
}

export interface ParticipantAwardedV2 extends ParticipantAwarded {
  type: string;
}
