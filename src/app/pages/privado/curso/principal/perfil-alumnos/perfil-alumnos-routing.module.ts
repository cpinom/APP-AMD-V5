import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PerfilAlumnosPage } from './perfil-alumnos.page';

const routes: Routes = [
  {
    path: '',
    component: PerfilAlumnosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerfilAlumnosPageRoutingModule { }
