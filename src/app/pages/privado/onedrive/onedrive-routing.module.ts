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
  },  {
    path: 'compartir',
    loadChildren: () => import('./compartir/compartir.module').then( m => m.CompartirPageModule)
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OnedrivePageRoutingModule { }
