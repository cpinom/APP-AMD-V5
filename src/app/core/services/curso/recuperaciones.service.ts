import { Injectable } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { PrivateService } from '../private.service';
import { AppGlobal } from '../../../app.global';
import { CachingService } from '../caching.service';
import { ToastController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class RecuperacionesService extends PrivateService {

  constructor(global: AppGlobal,
    auth: AuthService,
    caching: CachingService,
    toast: ToastController,
  ) {
    super(global, auth, caching, toast);
  }

  getPrincipal(params: any, forceRefresh = false) {
    return this.post(`${this.baseUrl}/recuperaciones/v4/principal`, params, forceRefresh);
  }
  getPrincipalV5(periCcod: any, sedeCcod: any, asigCcod: any, seccCcod: any, ssecNcorr: any) {
    return this.get(`${this.baseUrl}/recuperaciones/v5/principal?periCcod=${periCcod}&sedeCcod=${sedeCcod}&asigCcod=${asigCcod}&seccCcod=${seccCcod}&ssecNcorr=${ssecNcorr}`);
  }
  getDetalleSolicitud(params: any) {
    return this.post(`${this.baseUrl}/recuperaciones/v4/detalle-solicitud`, params, undefined, undefined, true);
  }
  getHorariosDisponibles(params: any) {
    return this.post(`${this.baseUrl}/recuperaciones/v4/horarios-disponibles`, params);
  }
  generarSolicitud(params: any) {
    return this.post(`${this.baseUrl}/recuperaciones/v4/generar-solicitud`, params);
  }

}
