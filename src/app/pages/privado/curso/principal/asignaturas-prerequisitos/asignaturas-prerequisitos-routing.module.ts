import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AsignaturasPrerequisitosPage } from './asignaturas-prerequisitos.page';

const routes: Routes = [
  {
    path: '',
    component: AsignaturasPrerequisitosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AsignaturasPrerequisitosPageRoutingModule {}
