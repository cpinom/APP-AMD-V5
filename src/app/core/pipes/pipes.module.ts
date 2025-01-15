import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatMomentPipe } from './format-moment.pipe';
import { StripHtmlPipe } from './strip-html.pipe';
import { StripTablePipe } from './strip-table.pipe';
import { SafeHtmlPipe } from './safe-html.pipe';

@NgModule({
  declarations: [FormatMomentPipe, StripHtmlPipe, StripTablePipe, SafeHtmlPipe],
  imports: [CommonModule],
  exports: [FormatMomentPipe, StripHtmlPipe, StripTablePipe, SafeHtmlPipe]
})
export class PipesModule { }
