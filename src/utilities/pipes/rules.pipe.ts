import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rules',
  standalone: true
})
export class RulesPipe implements PipeTransform {

  transform(arr: any[]): any[] {
    return arr.reduce((acc, curr) => {
      if(curr.fromDate) {
        acc.push(curr);
      }

      return acc;
    }, []);
  }

}
