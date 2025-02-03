import { Injectable } from '@angular/core';
import { PrivateService } from '../private.service';
import { AppGlobal } from '../../../app.global';
import { CachingService } from '../caching.service';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../auth/auth.service';


@Injectable({
  providedIn: 'root'
})
export class MensajesService extends PrivateService {

  constructor(global: AppGlobal,
    auth: AuthService,
    caching: CachingService,
    toast: ToastController,
    ) {
    super(global, auth, caching, toast);
  }
  getPrincipal(params: any, forceRefresh = false) {
    return this.post(`${this.baseUrl}/mensajes/v4/principal`, params, forceRefresh, undefined, true);
  }
  // agregarArchivoWeb(data: FormData, params: any) {
  //   return this.uploadWeb(`${this.baseUrl}/mensajes/v4/agregar-archivo`, data, params);
  // }
  // agregarArchivo(filepath: string, filename: string, params: any) {
  //   return this.upload(`${this.baseUrl}/mensajes/v4/agregar-archivo`, filepath, filename, params);
  // }
  agregarArchivoV5(messageId: string, params: any) {
    return this.post(`${this.baseUrl}/mensajes/v5/agregar-archivo?messageId=${messageId}`, params);
  }
  eliminarArchivo(params: any) {
    return this.post(`${this.baseUrl}/mensajes/v4/eliminar-archivo`, params);
  }
  eliminarBorrador(params: any) {
    return this.post(`${this.baseUrl}/mensajes/v4/eliminar-borrador`, params);
  }
  enviarMensaje(params: any) {
    return this.post(`${this.baseUrl}/mensajes/v4/enviar-mensaje`, params);
  }


}
