import { Directive, HostListener } from '@angular/core';
import { UtilsService } from '../services/utils.service';

declare const $: any;

@Directive({
  selector: '[delegate]'
})
export class DelegateDirective {

  constructor(private utils: UtilsService) { }

  @HostListener('click', ['$event']) onClick(event: any) {
    const link = $(event.target).closest('a[href]');

    if (link.length) {
      event.preventDefault();
      const url = $(link).attr('href');
      this.utils.openLink(url!);
    }
  }

}
