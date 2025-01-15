import { Injectable } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { PrivateService } from '../private.service';
import { AppGlobal } from '../../../app.global';
import { CachingService } from '../caching.service';
import { ToastController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';


@Injectable({
  providedIn: 'root'
})
export class EvaluacionesService extends PrivateService {

  private storagePrefix: string = 'Evaluaciones-AMD';

  constructor(global: AppGlobal,
    auth: AuthService,
    caching: CachingService,
    toast: ToastController,
    ) {
    super(global, auth, caching, toast);
  }

  getPrincipal(params: any, forceRefresh = false) {
    return this.post(`${this.baseUrl}/evaluaciones/v4/principal`, params, forceRefresh, undefined, true);
  }
  getNotasEvaluacion(params: any) {
    return this.post(`${this.baseUrl}/evaluaciones/v4/notas-evaluacion`, params, true);
  }
  guardarNotasEvaluacion(params: any) {
    return this.post(`${this.baseUrl}/evaluaciones/v4/guardar-notas`, params, undefined, undefined, false);
  }
  getAutenticacion(params: any) {
    return this.post(`${this.baseUrl}/evaluaciones/v4/autenticacion`, params, undefined, undefined, false);
  }
  validarUsuario(params: any) {
    return this.post(`${this.baseUrl}/evaluaciones/v4/validar-usuario`, params, undefined, undefined, false);
  }

  async setStorage(key: any, value: any) {
    await Preferences.set({ key: `${this.storagePrefix}-${key}`, value: JSON.stringify(value) });
  }
  async getStorage(key: any) {
    const result = await Preferences.get({ key: `${this.storagePrefix}-${key}` });
    return result.value ? JSON.parse(result.value) : null;
  }
  async clearStorage() {
    await Preferences.remove({ key: `${this.storagePrefix}-token` });
  }

}
