import { Pipe, PipeTransform } from '@angular/core';

declare var $:any;

@Pipe({
  name: 'stripTable'
})
export class StripTablePipe implements PipeTransform {

  transform(value: string): string {
    let $wrapper = $('<div />').append(value);
    let $tables = $('table', $wrapper);

    $wrapper.find('.MsoNormal, .MsoNormalCxSpMiddle, .MsoNormalCxSpFirst').removeAttr('class');

    $tables.removeAttr('class');
    $tables.removeAttr('width');
    $tables.removeAttr('border');
    $tables.removeAttr('cellspacing');
    $tables.removeAttr('cellpadding');
    $tables.find('th, td').removeAttr('width').removeAttr('valign').removeAttr('nowrap');
    $tables.find('[align]').removeAttr('align');

    return $wrapper.html();
  }

}
