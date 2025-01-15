import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InacapmailPage } from './inacapmail.page';

const routes: Routes = [
  {
    path: '',
    component: InacapmailPage
  },
  // {
  //   path: 'folder-content',
  //   loadChildren: () => import('./folder-content/folder-content.module').then(m => m.FolderContentPageModule)
  // },
  // {
  //   path: 'message-content',
  //   loadChildren: () => import('./message-content/message-content.module').then(m => m.MessageContentPageModule)
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InacapmailPageRoutingModule { }
