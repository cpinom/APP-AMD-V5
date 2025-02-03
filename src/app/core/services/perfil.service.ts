import { Injectable } from '@angular/core';
import { PrivateService } from './private.service';
import { AppGlobal } from '../../app.global';
import { AuthService } from '../auth/auth.service';
import { CachingService } from './caching.service';
import { ToastController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';


@Injectable({
  providedIn: 'root'
})
export class PerfilService extends PrivateService {

  private storagePrefix: string = 'Perfil-AMD';

  constructor(global: AppGlobal,
    auth: AuthService,
    caching: CachingService,
    toast: ToastController,
    ) {
    super(global, auth, caching, toast);
  }
  preferencias() {
    return this.get(`${this.baseUrl}/perfil/v4/preferencias`);
  }
  guardarPreferencias(params: any) {
    return this.post(`${this.baseUrl}/perfil/v4/preferencias`, params);
  }
  estadoPin() {
    return this.get(`${this.baseUrl}/perfil/v4/estado-pin`);
  }
  deshabilitarPin() {
    return this.get(`${this.baseUrl}/perfil/v4/deshabilitar-pin`);
  }
  guardarPin(params: any) {
    return this.post(`${this.baseUrl}/perfil/v4/guardar-pin`, params);
  }
  registrarAcceso(params: any) {
    return this.post(`${this.baseUrl}/v4/acceso`, params);
  }
  registrarSalida(params: any) {
    return this.post(`${this.baseUrl}/v4/salida`, params, undefined, true);
  }
  notificaciones(forceRefresh = false) {
    return this.get(`${this.baseUrl}/perfil/v4/notificaciones`, forceRefresh);
  }
  eliminarNotificacion(params: any) {
    return this.post(`${this.baseUrl}/perfil/v4/eliminar-notificacion`, params);
  }
  eliminarNotificaciones(params: any) {
    return this.post(`${this.baseUrl}/perfil/v4/eliminar-notificaciones`, params);
  }
  confirmarCorreo(params: any) {
    return this.post(`${this.baseUrl}/perfil/v4/confirmar-correo`, params);
  }
  confirmarTelefono(params: any): Promise<any> {
    return this.post(`${this.baseUrl}/perfil/v4/confirmar-telefono`, params);
  }
  confirmarPin(params: any) {
    return this.post(`${this.baseUrl}/perfil/v4/confirmar-pin`, params);
  }


  applyFontSize(fontSizeRange: number) {
    if (fontSizeRange == 0) {
      this.toggleBodyClass('small', true);
      this.toggleBodyClass('small-1');
      this.toggleBodyClass('large', true);
      this.toggleBodyClass('large-1', true);
    } else if (fontSizeRange == 1) {
      this.toggleBodyClass('small');
      this.toggleBodyClass('small-1', true);
      this.toggleBodyClass('large', true);
      this.toggleBodyClass('large-1', true);
    } else if (fontSizeRange == 2) {
      this.toggleBodyClass('small', true);
      this.toggleBodyClass('small-1', true);
      this.toggleBodyClass('large', true);
      this.toggleBodyClass('large-1', true);
    } else if (fontSizeRange == 3) {
      this.toggleBodyClass('small', true);
      this.toggleBodyClass('small-1', true);
      this.toggleBodyClass('large');
      this.toggleBodyClass('large-1', true);
    } else if (fontSizeRange == 4) {
      this.toggleBodyClass('small', true);
      this.toggleBodyClass('small-1', true);
      this.toggleBodyClass('large', true);
      this.toggleBodyClass('large-1');
    }
  }
  toggleBodyClass(cls: string, remove?: boolean) {
    let result = remove === true ? true : document.body.classList.contains(cls);
    document.body.classList.toggle(cls, !result);
  }
  toggleDarkMode(darkMode: boolean) {
    document.body.classList.toggle('dark', darkMode);
  }
  isDarkMode() {
    return document.body.classList.contains('dark');
  }
  async setStorage(key: string, value: any) {
    await Preferences.set({ key: `${this.storagePrefix}-${key}`, value: JSON.stringify(value) });
  }
  async getStorage(key: string) {
    const result = await Preferences.get({ key: `${this.storagePrefix}-${key}` });
    return result.value ? JSON.parse(result.value) : null;
  }
  async clearStorage() {
    await Preferences.remove({ key: `${this.storagePrefix}-preferencias` });
  }

}
