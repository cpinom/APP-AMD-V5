import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrincipalPage } from './principal.page';

const routes: Routes = [
  {
    path: '',
    component: PrincipalPage
  },
  {
    path: 'aprendizajes-esperados',
    loadChildren: () => import('./aprendizajes-esperados/aprendizajes-esperados.module').then(m => m.AprendizajesEsperadosPageModule)
  },
  {
    path: 'resumen',
    loadChildren: () => import('./resumen/resumen.module').then(m => m.ResumenPageModule)
  },
  {
    path: 'actualizar-asistencia',
    loadChildren: () => import('./actualizar-asistencia/actualizar-asistencia.module').then(m => m.ActualizarAsistenciaPageModule)
  },
  {
    path: 'soporte-tecnico',
    loadChildren: () => import('./soporte-tecnico/soporte-tecnico.module').then(m => m.SoporteTecnicoPageModule)
  },
  {
    path: 'cambiar-sala',
    loadChildren: () => import('./cambiar-sala/cambiar-sala.module').then(m => m.CambiarSalaPageModule)
  },
  {
    path: 'riesgos-alumnos',
    loadChildren: () => import('./riesgos-alumnos/riesgos-alumnos.module').then( m => m.RiesgosAlumnosPageModule)
  },
  {
    path: 'asesor-pedagogico',
    loadChildren: () => import('./asesor-pedagogico/asesor-pedagogico.module').then( m => m.AsesorPedagogicoPageModule)
  },
  {
    path: 'distribucion-notas',
    loadChildren: () => import('./distribucion-notas/distribucion-notas.module').then( m => m.DistribucionNotasPageModule)
  },
  {
    path: 'oportunidades-alumnos',
    loadChildren: () => import('./oportunidades-alumnos/oportunidades-alumnos.module').then( m => m.OportunidadesAlumnosPageModule)
  },
  {
    path: 'tipos-alumnos',
    loadChildren: () => import('./tipos-alumnos/tipos-alumnos.module').then( m => m.TiposAlumnosPageModule)
  },
  {
    path: 'perfil-alumnos',
    loadChildren: () => import('./perfil-alumnos/perfil-alumnos.module').then( m => m.PerfilAlumnosPageModule)
  },
  {
    path: 'asignaturas-prerequisitos',
    loadChildren: () => import('./asignaturas-prerequisitos/asignaturas-prerequisitos.module').then( m => m.AsignaturasPrerequisitosPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrincipalPageRoutingModule { }
