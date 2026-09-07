export interface ErrorResponse {
  title?: string;
  detail?: string;
  status?: number;
  developerMessage?: string;
}

export interface ErrorResponseDisubersement {
  errorType?: string;
  errorCode?: string;
  errorName?: string;
  errorMessage?: string;
  developerMessage?: string;
}

export interface ErrorResponseValidations {
  type: string
  title: string
  status: number
  detail: string
  errors: ValidationError[]
}

export interface ValidationError {
  code: string
  description: string
  type: number
}
