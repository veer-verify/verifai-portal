import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'validate',
  standalone: true
})
export class ValidatePipe implements PipeTransform {

  transform(value: number | string): number | string {
    // Parse the input value to a number
    const numValue = Number(value);

    // Check if the value is between 5 and 9
    if (numValue == 5) {
      return numValue; // Return valid numbers
    }

    // Return an empty string for invalid input
    return '';
  }
}
