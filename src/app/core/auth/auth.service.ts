import { Injectable } from '@angular/core';
import { AppGlobal } from '../../app.global';
import { Preferences } from '@capacitor/preferences';
import { ActionSheetController, NavController } from '@ionic/angular';
import { EventsService } from '../services/events.services';
import { Salida } from './auth.interfaces';
import { CachingService } from '../services/caching.service';
import { CapacitorHttp, HttpOptions } from '@capacitor/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string;
  private storageAuth: string = 'Auth-AMD';

  constructor(private global: AppGlobal,
    private nav: NavController,
    private action: ActionSheetController,
    private events: EventsService,
    private caching: CachingService) {
    this.baseUrl = `${this.global.Api}/api`;
  }
  async buscarCuenta(params: any) {
    const options: HttpOptions = {
      url: this.baseUrl + '/v4/buscar-cuenta',
      data: params,
      responseType: 'json',
      headers: { 'Content-Type': 'application/json' }
    };

    const response = await CapacitorHttp.post(options);

    if (response.status == 200) {
      return response;
    } else {
      return Promise.reject(response);
    }
  }
  async login(params: any) {
    const options: HttpOptions = {
      url: this.baseUrl + '/v4/login',
      data: params,
      responseType: 'json',
      headers: { 'Content-Type': 'application/json' }
    };

    const response = await CapacitorHttp.post(options);

    if (response.status == 200) {
      return response;
    } else {
      return Promise.reject(response);
    }
  }
  async getAuth() {
    const result = await Preferences.get({ key: this.storageAuth });
    return result.value ? JSON.parse(result.value) : null;
  }
  async tokenValid() {
    let auth = await this.getAuth();

    if (auth && auth.expiration_date) {
      let now = moment();
      let expiration_date = moment(auth.expiration_date);

      if (now.isSameOrBefore(expiration_date, 'seconds')) {
        return true;
      } else {
        await this.clearAuth();
        return false;
      }
    }

    return false;
  }
  async setAuth(auth: any) {
    try {
      if (auth.expires > 0) {
        auth.expiration_date = moment().add(auth.expires, 'minutes');
        auth.expires = 0;
      }

      await Preferences.set({ key: this.storageAuth, value: JSON.stringify(auth) });

      return true;
    }
    catch {
      return false;
    }
  }
  async clearAuth() {
    const salida: Salida = {
      uuid: this.global.DeviceId
    };
    this.events.onLogout.next(salida);
    this.caching.clearCachedData();
    Preferences.remove({ key: this.storageAuth });
  }
  async tryLogout() {
    let buttons = [
      {
        text: 'Salir',
        role: 'destructive',
        handler: async () => {
          await this.clearAuth();
          await this.nav.navigateBack('/publico');
        }
      },
      {
        text: 'Cancelar',
        role: 'cancel'
      }
    ];

    const actionSheet = await this.action.create({
      header: '¿Segur@ que quieres cerrar la sesión?',
      buttons: buttons
    });

    await actionSheet.present();
  }

}
