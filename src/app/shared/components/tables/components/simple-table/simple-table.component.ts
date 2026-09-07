import { Component, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'fi-simple-table',
  templateUrl: './simple-table.component.html',
})
export class SimpleTableComponent<T> {
  @Input() description = '';
  @Input() dataSource: T[];
  @Input() rowsTemplate?: TemplateRef<unknown>;

  @Input() sortByKey: string;
  @Input() sortDirection: 'asc' | 'desc' = 'asc';

  sort(key: string, array: T[]) {
    if (!key) {
      return array;
    }
    return array.sort((a, b) =>
      this.compare(a[key], b[key], this.sortDirection === 'asc')
    );
  }

  get data() {
    return this.sort(this.sortByKey, this.dataSource);
  }

  compare<T>(a: T, b: T, isAsc = true): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
