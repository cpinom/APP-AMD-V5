import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DelegateDirective } from './delegate.directive';
import { ImageDirective } from './image.directive';

@NgModule({
  declarations: [DelegateDirective, ImageDirective],
  imports: [CommonModule],
  exports: [DelegateDirective, ImageDirective]
})
export class DirectivesModule { }
