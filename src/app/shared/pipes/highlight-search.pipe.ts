import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
@Pipe({
  name: 'highlightSearch',
})
export class HighlightSearchPipe implements PipeTransform {
  constructor(readonly sanitizer: DomSanitizer) {}

  setExpToNumber(filterArg: string): string {
    const htmlInput = filterArg;
    const array = Array.from(htmlInput);
    let newArray = '';
    const arrayLenght = array.length - 1;
    array.forEach((a, index) => {
      newArray = `${newArray}(${a})`;
      if (index !== arrayLenght) {
        newArray = `${newArray}(,)*(\\.)*`;
      }
    });
    return `(${htmlInput})|(${newArray})`;
  }

  setExp(args: string[]): string {
    const aux = args[0].split('');
    aux.forEach((char, i, arr) => {
      if (char === '(' || char === ')') {
        arr[i] = `\\${char}`;
      }
    });
    return aux.join('');
  }

  transform(value: string, ...args: string[]): SafeHtml {
    if (!value) {
      return null;
    }
    value = value.toString();
    if (args[0] === null || args[0] === '' || args[0] === undefined) {
      return value;
    }
    let result = '';
    if (args[1] === undefined) {
      // Match in a case insensitive maneer
      const re = new RegExp(this.setExp(args), 'gi');
      const match = value.match(re);
      // If there's no match, just return the original value.
      if (!match) {
        return value;
      }

      result = value.replace(
        re,
        `<mark style="background-color: #FDFD51;">${match[0]}</mark>`
      );
    } else {
      const dynamicPart = this.setExpToNumber(args[0]);
      const regexObj = new RegExp(dynamicPart);
      const match = value.match(regexObj);
      if (!match) {
        return value;
      }
      result = value.replace(
        regexObj,
        `<mark style="background-color: #FDFD51;">${match[0]}</mark>`
      );
    }

    return this.sanitizer.bypassSecurityTrustHtml(result);
  }
}
