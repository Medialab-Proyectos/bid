export interface FormConfig {
  commentsSection: {
    isDisabled: boolean;
  };
  costDistributionSection: {
    isDisabled: boolean;
    justification?: string;
  };
  outputsSection: {
    isDisabled: boolean;
  };
  milestoneSection: {
    isEstimatedDateDisabled: boolean;
    isEstimatedDateVisible: boolean;
    isReEstimatedDateDisabled: boolean;
    isReEstimatedDateVisible: boolean;
    isActualDateDisabled: boolean;
    isActualDateVisible: boolean;
    disabledRestimatedDates: boolean[];
  };
  mode: ModeOfProcurementForm;
}

export enum ModeOfProcurementForm {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
}
