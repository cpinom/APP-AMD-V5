import { Injectable } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { PrivateService } from '../private.service';
import { AppGlobal } from '../../../app.global';
import { CachingService } from '../caching.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService extends PrivateService {

  constructor(global: AppGlobal,
    auth: AuthService,
    caching: CachingService,
    toast: ToastController,
  ) {
    super(global, auth, caching, toast);
  }

  getPrincipal(params: any, forceRefresh = false) {
    return this.post(`${this.baseUrl}/asistencia/v4/principal`, params, forceRefresh, undefined, true);
  }
  getPrincipalV5(seccCcod: any, ssecNcorr:any) {
    return this.get(`${this.baseUrl}/asistencia/v5/principal?seccCcod=${seccCcod}&ssecNcorr=${ssecNcorr}`, true);
  }

}
