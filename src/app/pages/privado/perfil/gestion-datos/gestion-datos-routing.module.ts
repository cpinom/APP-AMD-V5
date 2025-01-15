import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GestionDatosPage } from './gestion-datos.page';

const routes: Routes = [
  {
    path: '',
    component: GestionDatosPage
  },
  // {
  //   path: 'editar-correo',
  //   loadChildren: () => import('./editar-correo/editar-correo.module').then( m => m.EditarCorreoPageModule)
  // },
  // {
  //   path: 'editar-telefono',
  //   loadChildren: () => import('./editar-telefono/editar-telefono.module').then( m => m.EditarTelefonoPageModule)
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionDatosPageRoutingModule {}
