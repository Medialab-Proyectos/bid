export interface GetBiddingProcessComponentResponse {
  componentId: string;
  componentName: string;
  outputs: BiddingProcessOutput[];
}

export class BiddingProcessOutput {
  ouputId: string;
  ouputName: string;
  percentageAssigned: number;
}
