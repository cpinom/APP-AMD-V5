import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OnedrivePage } from './onedrive.page';

const routes: Routes = [
  {
    path: '',
    component: OnedrivePage
  },
  {
    path: ':folderId/:folderName',
    loadChildren: () => import('./folder-content/folder-content.module').then( m => m.FolderContentPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OnedrivePageRoutingModule { }
