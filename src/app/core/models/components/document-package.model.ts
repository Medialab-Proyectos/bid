export interface DocumentPackageItem {
  packageName: string;
  state: string;
  actualDate: Date;
  currentFiles: number;
  maximumFiles: number;
  commentsCount: number;
  files: DocumentFileItem[];
}

export interface DocumentFileItem {
  name: string;
  types: string;
  ezShareId: string;
}
