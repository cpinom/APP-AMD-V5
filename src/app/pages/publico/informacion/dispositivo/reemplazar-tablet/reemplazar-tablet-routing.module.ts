import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReemplazarTabletPage } from './reemplazar-tablet.page';

const routes: Routes = [
  {
    path: '',
    component: ReemplazarTabletPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReemplazarTabletPageRoutingModule { }
