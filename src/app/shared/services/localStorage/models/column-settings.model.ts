export interface ColumnSettings {
  field: string;
  title?: string;
  filter?: 'text' | 'numeric' | 'date' | 'boolean';
  format?: string;
  width?: number;
  _width?: number;
  filterable: boolean;
  orderIndex?: number;
  hidden?: boolean;
}
