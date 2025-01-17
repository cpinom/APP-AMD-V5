import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ApuntesClasesPage } from './apuntes-clases.page';

const routes: Routes = [
  {
    path: '',
    component: ApuntesClasesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApuntesClasesPageRoutingModule {}
