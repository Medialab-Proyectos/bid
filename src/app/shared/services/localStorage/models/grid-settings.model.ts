import { State, DataResult } from '@progress/kendo-data-query';
import { ColumnSettings } from './column-settings.model';

export interface GridSettings {
  columnsConfig: ColumnSettings[];
  state: State;
  gridData?: DataResult;
}
