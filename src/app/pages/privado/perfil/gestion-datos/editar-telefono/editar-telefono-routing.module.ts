import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditarTelefonoPage } from './editar-telefono.page';

const routes: Routes = [
  {
    path: '',
    component: EditarTelefonoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditarTelefonoPageRoutingModule { }
