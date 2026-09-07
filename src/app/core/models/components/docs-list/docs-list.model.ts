export interface DocsList {
  title: string;
  docs: Docs[];
}

interface Docs {
  documentCode: number;
  uploaded: boolean;
}
