import { Pipe, PipeTransform } from '@angular/core';
import { MESSAGES } from '../constants/messages';

@Pipe({
  name: 'message'
})
export class MessagePipe implements PipeTransform {

  transform(value: string): string {
    return value.split('.').reduce((obj: any, key) => obj?.[key], MESSAGES) || 'Mensaje no encontrado';
  }

}
