import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InacapPage } from './inacap.page';

const routes: Routes = [
  {
    path: '',
    component: InacapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InacapPageRoutingModule { }
