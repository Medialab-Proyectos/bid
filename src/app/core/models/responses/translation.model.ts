export interface GetTranslationsResponse {
  isValid: boolean;
  errorType: string;
  errorCode: string;
  errorMessage: string;
  developerMessage: string;
  data: {
    currentLang: {
      lang: string;
    };
    [key: string]: {
      [key: string]: string;
    };
  };
}

export interface GetTranslationsResponseError {
  errorType: string;
  errorCode: string;
  errorName: string;
  errorMessage: string;
  developerMessage: string;
  cause: {
    ClassName: string;
    Message: string;
    Data: unknown;
    InnerException: unknown;
    HelpURL: unknown;
    StackTraceString: string;
    RemoteStackTraceString: unknown;
    RemoteStackIndex: number;
    ExceptionMethod: unknown;
    HResult: number;
    Source: string;
    WatsonBuckets: unknown;
  };
}
