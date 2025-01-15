import { Pipe, PipeTransform } from '@angular/core';
import { Moment } from 'moment';

@Pipe({
  name: 'formatMoment'
})
export class FormatMomentPipe implements PipeTransform {

  transform(value: Moment, format: string): string {
    if (format == 'dd') return value.format(format)[0];
    return value.format(format);
  }

}
