import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthAccess } from 'src/app/core/auth/auth.access';
import { PrivadoPage } from './privado.page';

const routes: Routes = [
  {
    path: '',
    component: PrivadoPage
  },
  {
    path: 'inacapmail',
    canActivate: [AuthAccess],
    loadChildren: () => import('./inacapmail/inacapmail.module').then(m => m.InacapmailPageModule)
  },
  {
    path: 'curso',
    canActivate: [AuthAccess],
    loadChildren: () => import('./curso/curso.module').then(m => m.CursoPageModule)
  },
  {
    path: 'comunicaciones',
    canActivate: [AuthAccess],
    loadChildren: () => import('./comunicaciones/comunicaciones.module').then(m => m.ComunicacionesPageModule)
  },
  {
    path: 'microsoft-teams',
    canActivate: [AuthAccess],
    loadChildren: () => import('./microsoft-teams/microsoft-teams.module').then(m => m.MicrosoftTeamsPageModule)
  },
  {
    path: 'evaluacion-docente',
    canActivate: [AuthAccess],
    loadChildren: () => import('./evaluacion-docente/evaluacion-docente.module').then(m => m.EvaluacionDocentePageModule)
  },
  {
    path: 'contactos-sedes',
    canActivate: [AuthAccess],
    loadChildren: () => import('./contactos-sedes/contactos-sedes.module').then(m => m.ContactosSedesPageModule)
  },
  {
    path: 'buzon-opiniones',
    canActivate: [AuthAccess],
    loadChildren: () => import('./buzon-opiniones/buzon-opiniones.module').then(m => m.BuzonOpinionesPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrivadoPageRoutingModule { }
