import { Injectable } from '@angular/core';
import { PrivateService } from './private.service';
import { AppGlobal } from '../../app.global';
import { AuthService } from '../auth/auth.service';
import { CachingService } from './caching.service';
import { ToastController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class ComunicacionesService extends PrivateService {

  constructor(global: AppGlobal,
    auth: AuthService,
    caching: CachingService,
    toast: ToastController,
    ) {
    super(global, auth, caching, toast);
  }
  getPrincipal(forceRefresh = false) {
    return this.get(`${this.baseUrl}/comunicaciones/v4/principal`, forceRefresh, undefined, false);
  }
  agregarArchivoWeb(data: FormData, params: any) {
    return this.uploadWeb(`${this.baseUrl}/comunicaciones/v4/agregar-archivo`, data, params);
  }
  agregarArchivo(filepath: string, filename: string, params: any) {
    return this.upload(`${this.baseUrl}/comunicaciones/v4/agregar-archivo`, filepath, filename, params);
  }
  eliminarArchivo(params: any) {
    return this.post(`${this.baseUrl}/comunicaciones/v4/eliminar-archivo`, params);
  }
  eliminarBorrador(params: any) {
    return this.post(`${this.baseUrl}/comunicaciones/v4/eliminar-borrador`, params);
  }
  enviarMensaje(params: any) {
    return this.post(`${this.baseUrl}/comunicaciones/v4/enviar-mensaje`, params);
  }

}
