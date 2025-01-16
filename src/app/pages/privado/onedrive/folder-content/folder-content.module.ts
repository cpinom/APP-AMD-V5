import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FolderContentPageRoutingModule } from './folder-content-routing.module';
import { FolderContentPage } from './folder-content.page';
import { PipesModule } from 'src/app/core/pipes/pipes.module';
import { DirectivesModule } from 'src/app/core/directives/directives.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FolderContentPageRoutingModule,
    PipesModule,
    DirectivesModule
  ],
  declarations: [FolderContentPage]
})
export class FolderContentPageModule { }
