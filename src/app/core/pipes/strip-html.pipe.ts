import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripHtml'
})
export class StripHtmlPipe implements PipeTransform {

  transform(value: string): string {
    if(!value) return value;
    
    value = value.replace(/<[^>]*>?/gm, '');
    value = value.replace(/&nbsp;/g, ' ');

    return value;
  }

}
