import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormularioTabletPage } from './formulario-tablet.page';

const routes: Routes = [
  {
    path: '',
    component: FormularioTabletPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormularioTabletPageRoutingModule { }
