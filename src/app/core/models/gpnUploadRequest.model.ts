export interface GpnUploadRequest {
  document: {
    name: string;
    blobId: string;
    language: string;
    extension?: string;
  };
  projectNumber: string;
  institutionAcronym: string;
}
