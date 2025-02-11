import { Injectable } from '@angular/core';
import { PublicoService } from './publico.service';
import { AppGlobal } from '../../app.global';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class DispositivoService extends PublicoService {

  override storagePrefix: string = 'Device-AMD';

  constructor(global: AppGlobal, storage: Storage) {
    super(global, storage);
  }
  acceso(params: any) {
    return this.post(`${this.baseUrl}/dispositivo/v4/acceso`, params);
  }
  actualizarTablet(params: any) {
    return this.post(`${this.baseUrl}/dispositivo/v4/actualizar-tablet`, params);
  }
  actualizarTabletV5(params: any) {
    return this.patch(`${this.baseUrl}/dispositivo/v5/actualizar-tablet`, params);
  }
  actualizarBateriaTablet(params: any) {
    return this.post(`${this.baseUrl}/dispositivo/v4/estado-bateria`, params);
  }
  // status(params: any) {
  //   return this.post(`${this.baseUrl}/dispositivo/v4/status`, params);
  // }
  registrarDispositivo(params: any) {
    return this.post(`${this.baseUrl}/dispositivo/v4/registro`, params);
  }
  async setAuth(value: any, minutes: moment.DurationInputArg1) {
    const expiration_date = moment().add(minutes, 'minutes');
    Object.assign(value, { expiration_date: expiration_date });
    await this.setStorage('Data', JSON.stringify(value))
  }
  async getData() {
    const value = await this.getStorage(`Data`);
    return value ? JSON.parse(value) : null;
  }
  async dataValid() {
    let auth = await this.getData();

    if (auth && auth.expiration_date) {
      let now = moment();
      let expiration_date = moment(auth.expiration_date);

      if (now.isSameOrBefore(expiration_date, 'seconds')) {
        return true;
      } else {
        await this.clearData();
        return false;
      }
    }

    return false;
  }
  async clearData() {
    await this.removeStorage('Data');
  }
  async setDeviceId(id: string) {
    await this.setStorage(`Id`, id);
  }
  async getDeviceId() {
    const value = await this.getStorage(`Id`);
    return value;
  }
}
