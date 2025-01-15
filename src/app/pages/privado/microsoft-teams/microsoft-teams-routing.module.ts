import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MicrosoftTeamsPage } from './microsoft-teams.page';

const routes: Routes = [
  {
    path: '',
    component: MicrosoftTeamsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MicrosoftTeamsPageRoutingModule {}
