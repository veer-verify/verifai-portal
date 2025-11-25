import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'count',
  standalone: true
})
export class CountPipe implements PipeTransform {

  transform(array:any[], type:string, value:any): unknown {

    let filteredItems:any = [];
    array.filter((item:any) => {
      if(item[type] == value) {
        filteredItems.push(item)
      }

    });
    return filteredItems.length;
  }

  

}
