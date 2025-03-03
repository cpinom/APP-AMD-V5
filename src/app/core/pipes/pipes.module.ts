import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatMomentPipe } from './format-moment.pipe';
import { StripHtmlPipe } from './strip-html.pipe';
import { StripTablePipe } from './strip-table.pipe';
import { SafeHtmlPipe } from './safe-html.pipe';
import { FormatBytesPipe } from './format-bytes.pipe';
import { MessagePipe } from './message.pipe';

@NgModule({
  declarations: [
    MessagePipe,
    FormatMomentPipe,
    StripHtmlPipe,
    StripTablePipe,
    SafeHtmlPipe,
    FormatBytesPipe
  ],
  imports: [CommonModule],
  exports: [
    MessagePipe,
    FormatMomentPipe,
    StripHtmlPipe,
    StripTablePipe,
    SafeHtmlPipe,
    FormatBytesPipe
  ]
})
export class PipesModule { }
