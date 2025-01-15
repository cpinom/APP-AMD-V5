import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MessageContentPage } from './message-content.page';

const routes: Routes = [
  {
    path: '',
    component: MessageContentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessageContentPageRoutingModule { }
