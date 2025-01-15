import { Injectable } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { PrivateService } from '../private.service';
import { AppGlobal } from '../../../app.global';
import { CachingService } from '../caching.service';
import { ToastController } from '@ionic/angular';

declare const $: any;

@Injectable({
  providedIn: 'root'
})
export class ApuntesService extends PrivateService {

  constructor(global: AppGlobal,
    auth: AuthService,
    caching: CachingService,
    toast: ToastController,
    private auth1: AuthService) {
    super(global, auth, caching, toast);
  }

  getPrincipal(params: any, forceRefresh = false) {
    return this.post(`${this.baseUrl}/apuntes/v4/principal`, params, forceRefresh, undefined, true);
  }
  getHorarioSeccion(params: any) {
    return this.post(`${this.baseUrl}/apuntes/v4/horario-seccion`, params);
  }
  cargarArchivoWeb(data: FormData, params?: any) {
    return this.uploadWeb(`${this.baseUrl}/apuntes/v4/cargar-archivo`, data, params);
  }
  async cargarArchivo(filepath: string, filename: string, params?: any) {
    return this.upload(`${this.baseUrl}/apuntes/v4/cargar-archivo`, filepath, filename, params);
  }
  getArchivoApunte(params: any) {
    return this.post(`${this.baseUrl}/apuntes/v4/descargar-archivo`, params);
  }
  eliminarArchivoApunte(params: any) {
    return this.post(`${this.baseUrl}/apuntes/v4/eliminar-archivo`, params);
  }
  getApuntesClase(params: any) {
    return this.post(`${this.baseUrl}/apuntes/v4/apuntes-clase`, params);
  }
  guardarComentarioClase(params: any) {
    return this.post(`${this.baseUrl}/apuntes/v4/guardar-comentario`, params);
  }
  eliminarApunteClase(params: any) {
    return this.post(`${this.baseUrl}/apuntes/v4/eliminar-apunte`, params);
  }
}
