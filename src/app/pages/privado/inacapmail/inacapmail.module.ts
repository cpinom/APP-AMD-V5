import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InacapmailPageRoutingModule } from './inacapmail-routing.module';
import { InacapmailPage } from './inacapmail.page';
import { FolderContentPageModule } from './folder-content/folder-content.module';
import { MessageContentPageModule } from './message-content/message-content.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InacapmailPageRoutingModule,
    FolderContentPageModule,
    MessageContentPageModule
  ],
  declarations: [InacapmailPage]
})
export class InacapmailPageModule {}
