import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TiposAlumnosPage } from './tipos-alumnos.page';

const routes: Routes = [
  {
    path: '',
    component: TiposAlumnosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TiposAlumnosPageRoutingModule {}
