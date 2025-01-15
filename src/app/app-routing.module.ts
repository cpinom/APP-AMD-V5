import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'publico',
    pathMatch: 'full'
  },
  {
    path: 'publico',
    loadChildren: () => import('./pages/publico/publico.module').then(m => m.PublicoPageModule)
  },
  {
    path: 'privado',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/privado/privado.module').then(m => m.PrivadoPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
