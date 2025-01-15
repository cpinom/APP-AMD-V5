import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RecuperacionClasesPage } from './recuperacion-clases.page';

const routes: Routes = [
  {
    path: '',
    component: RecuperacionClasesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecuperacionClasesPageRoutingModule { }
