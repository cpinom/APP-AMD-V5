import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuzonOpinionesPage } from './buzon-opiniones.page';

const routes: Routes = [
  {
    path: '',
    component: BuzonOpinionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BuzonOpinionesPageRoutingModule { }
