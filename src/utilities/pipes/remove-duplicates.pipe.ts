import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeDuplicates',
  standalone: true
})
export class RemoveDuplicatesPipe implements PipeTransform {

  transform(array: any[], key: string): any[] {
    const uniqueArray = [];
    const seen = new Set();

    for (const item of array) {
      const value = item[key];
      if (!seen.has(value)) {
        seen.add(value);
        uniqueArray.push(item);
      }
    }
    return uniqueArray;
  }

}
