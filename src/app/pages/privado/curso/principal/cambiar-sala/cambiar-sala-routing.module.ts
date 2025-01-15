import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CambiarSalaPage } from './cambiar-sala.page';

const routes: Routes = [
  {
    path: '',
    component: CambiarSalaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CambiarSalaPageRoutingModule {}
