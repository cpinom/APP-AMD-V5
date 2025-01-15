import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionPinPage } from './gestion-pin.page';

const routes: Routes = [
  {
    path: '',
    component: GestionPinPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionPinPageRoutingModule {}
