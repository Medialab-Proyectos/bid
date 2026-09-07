import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { SortDirection, OptionEvent } from '../../models';

@Component({
  selector: 'fi-mobile-table',
  templateUrl: './mobile-table.component.html',
})
export class MobileTableComponent<T> {
  @Input() dataSource: T[];
  @Input() firstColumnTemplate?: TemplateRef<unknown>;
  @Input() rowsTemplate?: TemplateRef<unknown>;
  @Input() optionsColumnTemplate?: TemplateRef<unknown>;

  @Input() sortByKey: string;
  @Input() sortDirection: SortDirection = 'asc';

  @Input() options: string[];

  @Output() optionClick = new EventEmitter<OptionEvent<T>>();
  @Output() actionClick = new EventEmitter<T>();

  showMoreOptions(option: string, item: T): void {
    this.optionClick.emit({ item, option });
  }

  primaryAction(item: T): void {
    this.actionClick.emit(item);
  }
}
