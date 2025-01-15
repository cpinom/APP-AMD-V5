import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MicrosoftTeamsPageRoutingModule } from './microsoft-teams-routing.module';

import { MicrosoftTeamsPage } from './microsoft-teams.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MicrosoftTeamsPageRoutingModule
  ],
  declarations: [MicrosoftTeamsPage]
})
export class MicrosoftTeamsPageModule {}
