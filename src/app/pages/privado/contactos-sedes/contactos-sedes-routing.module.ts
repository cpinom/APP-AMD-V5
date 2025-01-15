import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContactosSedesPage } from './contactos-sedes.page';

const routes: Routes = [
  {
    path: '',
    component: ContactosSedesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContactosSedesPageRoutingModule {}
