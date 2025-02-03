import { Injectable } from '@angular/core';
import { PrivateService } from './private.service';
import { AppGlobal } from '../../app.global';
import { AuthService } from '../auth/auth.service';
import { CachingService } from './caching.service';
import { ToastController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class BuzonopinionService extends PrivateService {

  private storagePrefix: string = 'BuzonOpinion-AMD';

  constructor(global: AppGlobal,
    auth: AuthService,
    caching: CachingService,
    toast: ToastController,
    ) {
    super(global, auth, caching, toast);
  }
  getPrincipal(params: any) {
    return this.post(`${this.baseUrl}/buzon-opinion/v1/principal`, params);
  }
  getSubcategorias(params: any) {
    return this.post(`${this.baseUrl}/buzon-opinion/v1/subcategorias`, params);
  }
  getOpiniones(params: any) {
    return this.post(`${this.baseUrl}/buzon-opinion/v1/opiniones`, params);
  }
  enviarOpinion(params: any) {
    return this.post(`${this.baseUrl}/buzon-opinion/v1/enviar-opinion`, params);
  }
  getDetalleOpinion(params: any) {
    return this.post(`${this.baseUrl}/buzon-opinion/v1/detalle-opinion`, params);
  }
  // cargarArchivoWeb(data: FormData, params: any) {
  //   return this.uploadWeb(`${this.baseUrl}/buzon-opinion/v1/cargar-archivo`, data, params);
  // }
  // cargarArchivo(filepath: string, filename: string, params: any) {
  //   return this.upload(`${this.baseUrl}/buzon-opinion/v1/cargar-archivo`, filepath, filename, params);
  // }
  cargarArchivoV2(tuserCcod: any, params: any) {
    return this.post(`${this.baseUrl}/buzon-opinion/v2/cargar-archivo?tuserCcod=${tuserCcod}`, params);
  }

}
