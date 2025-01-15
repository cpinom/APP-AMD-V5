import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthAccess } from 'src/app/core/auth/auth.access';
import { CursoPage } from './curso.page';

const routes: Routes = [
  {
    path: '',
    component: CursoPage,
    children: [
      {
        path: '',
        redirectTo: 'principal',
        pathMatch: 'full'
      },
      {
        path: 'principal',
        loadChildren: () => import('./principal/principal.module').then(m => m.PrincipalPageModule)
      },
      {
        path: 'apuntes-clases',
        canActivate: [AuthAccess],
        loadChildren: () => import('./apuntes-clases/apuntes-clases.module').then(m => m.ApuntesClasesPageModule)
      },
      {
        path: 'descriptor-asignatura',
        canActivate: [AuthAccess],
        loadChildren: () => import('./descriptor-asignatura/descriptor-asignatura.module').then(m => m.DescriptorAsignaturaPageModule)
      },
      {
        path: 'recuperacion-clases',
        canActivate: [AuthAccess],
        loadChildren: () => import('./recuperacion-clases/recuperacion-clases.module').then(m => m.RecuperacionClasesPageModule)
      },
      {
        path: 'asistencia-clases',
        canActivate: [AuthAccess],
        loadChildren: () => import('./asistencia-clases/asistencia-clases.module').then(m => m.AsistenciaClasesPageModule)
      },
      {
        path: 'gestor-notas',
        canActivate: [AuthAccess],
        loadChildren: () => import('./gestor-notas/gestor-notas.module').then(m => m.GestorNotasPageModule)
      },
      {
        path: 'enviar-correo',
        canActivate: [AuthAccess],
        loadChildren: () => import('./enviar-correo/enviar-correo.module').then(m => m.EnviarCorreoPageModule)
      }
    ]
  },
  {
    path: 'registro-asistencia',
    canActivate: [AuthAccess],
    loadChildren: () => import('./registro-asistencia/registro-asistencia.module').then(m => m.RegistroAsistenciaPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CursoPageRoutingModule { }
