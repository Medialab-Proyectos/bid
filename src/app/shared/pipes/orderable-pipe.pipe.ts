import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderablePipe',
})
export class OrderablePipe implements PipeTransform {
  transform(value: string): string {
    if (value !== '') {
      const year = value.substring(0, 4);
      const number = parseInt(value.substring(4), 10);
      const formattedValue = `${year} - ${number}`;
      return formattedValue;
    }
  }
}
