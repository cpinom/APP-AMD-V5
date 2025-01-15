import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PublicoPage } from './publico.page';

const routes: Routes = [
  {
    path: '',
    component: PublicoPage,
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      },
      {
        path: 'inicio',
        loadChildren: () => import('./inicio/inicio.module').then(m => m.InicioPageModule)
      },
      {
        path: 'inacap',
        loadChildren: () => import('./inacap/inacap.module').then(m => m.InacapPageModule)
      },
      {
        path: 'carreras',
        loadChildren: () => import('./carreras/carreras.module').then(m => m.CarrerasPageModule)
      },
      {
        path: 'sedes',
        loadChildren: () => import('./sedes/sedes.module').then(m => m.SedesPageModule)
      },
      {
        path: 'servicios',
        loadChildren: () => import('./servicios/servicios.module').then(m => m.ServiciosPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicoPageRoutingModule { }
