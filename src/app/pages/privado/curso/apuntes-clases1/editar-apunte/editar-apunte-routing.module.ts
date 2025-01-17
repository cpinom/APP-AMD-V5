import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditarApuntePage } from './editar-apunte.page';

const routes: Routes = [
  {
    path: '',
    component: EditarApuntePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditarApuntePageRoutingModule {}
