import { Injectable } from '@angular/core';
import { AppGlobal } from 'src/app/app.global';
import { AuthService } from '../auth/auth.service';
import { CachingService } from './caching.service';
import { ToastController } from '@ionic/angular';
import { PrivateService } from './private.service';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class OnedriveService extends PrivateService {

  private storagePrefix: string = 'OveDrive-MOVIL';
  private apiPrefix = 'api/onedrive';

  constructor(global: AppGlobal,
    auth: AuthService,
    caching: CachingService,
    toast: ToastController) {
    super(global, auth, caching, toast);
    this.baseUrl = `${global.Api}/${this.apiPrefix}`;
  }

  getCursos() {
    return this.get(`${this.baseUrl}/v1/cursos`);
  }
  getPrincipal(driveId: string) {
    return this.get(`${this.baseUrl}/v1/principal?driveId=${driveId}`);
  }
  getArchivos(driveId: string, driveItemId: string) {
    driveId = encodeURIComponent(driveId);
    driveItemId = encodeURIComponent(driveItemId);
    return this.get(`${this.baseUrl}/v1/archivos?driveId=${driveId}&driveItemId=${driveItemId}`);
  }
  crearCarpeta(params: any) {
    return this.post(`${this.baseUrl}/v1/crear-carpeta`, params);
  }
  cargarArchivo(folderId: string, params: any) {
    return this.post(`${this.baseUrl}/v1/cargar-archivo?folderId=${folderId}`, params);
  }
  descargarArchivo(folderId: string, fileId: string) {
    folderId = encodeURIComponent(folderId);
    fileId = encodeURIComponent(fileId);
    return this.get(`${this.baseUrl}/v1/descargar-archivo?folderId=${folderId}&fileId=${fileId}`);
  }
  renombrarCarpeta(params: any) {
    return this.patch(`${this.baseUrl}/v1/renombrar-carpeta`, params);
  }
  eliminarArchivo(folderId: string, fileId: string) {
    return this.delete(`${this.baseUrl}/v1/eliminar-archivo?folderId=${folderId}&fileId=${fileId}`);
  }
  compartirArchivo(params: any) {
    return this.post(`${this.baseUrl}/v1/compartir`, params);
  }
  async setStorage(key: string, value: any) {
    await Preferences.set({
      key: `${this.storagePrefix}-${key}`,
      value: JSON.stringify(value)
    });
  }
  async getStorage(key: string) {
    return Preferences.get({ key: `${this.storagePrefix}-${key}` }).then(result => {
      if (result.value) {
        return JSON.parse(result.value);
      }
      return result.value;
    });
  }
  async clearStorage() {
    await Preferences.remove({ key: `${this.storagePrefix}-driveId` });
  }
}
