import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GestionDatosPage } from './gestion-datos.page';

const routes: Routes = [
  {
    path: '',
    component: GestionDatosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionDatosPageRoutingModule {}
