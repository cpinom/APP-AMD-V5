import { Injectable } from '@angular/core';
// import { Http, HttpOptions } from '@capacitor-community/http';
import { AppGlobal } from '../../app.global';
import { CapacitorHttp, HttpOptions } from '@capacitor/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class PublicoService {

  storagePrefix: string = 'Publico-AMD';
  baseUrl: string = '';

  constructor(private global: AppGlobal, private storage: Storage) {
    this.baseUrl = `${this.global.Api}/api`;
  }
  public get = async (url: string) => {
    const options: HttpOptions = {
      url: url,
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await CapacitorHttp.get(options);

      if (response.status == 200) {
        return response;
      } else {
        return Promise.reject(response);
      }
    }
    catch (error) {
      return Promise.reject(error);
    }
  }
  public post = async (url: string, params: any) => {
    const options: HttpOptions = {
      method: 'post',
      url: url,
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json'
      },
      data: params
    };

    try {
      const response = await CapacitorHttp.post(options);

      if (response.status == 200) {
        return response;
      } else {
        return Promise.reject(response);
      }
    }
    catch (error) {
      return Promise.reject(error);
    }
  }
  public patch = async (url: string, params?: any) => {
    const options: HttpOptions = {
      url: url,
      method: 'patch',
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json'
      },
      data: params || {}
    };

    const response = await CapacitorHttp.patch(options);

    if (response.status == 200) {
      return response;
    }

    return Promise.reject(response);
  }
  getPrincipal() {
    return this.get(`${this.baseUrl}/v3/principal`);
  }
  getInacap() {
    return this.get(`${this.baseUrl}/v3/inacap`);
  }
  getOferta() {
    return this.get(`${this.baseUrl}/v3/oferta`);
  }
  getCarrera(params: any) {
    return this.post(`${this.baseUrl}/v3/carrera`, params);
  }
  getSedes() {
    return this.get(`${this.baseUrl}/v3/sedes`);
  }
  getContacto() {
    return this.get(`${this.baseUrl}/v3/contacto`);
  }
  getAppVersion() {
    return this.get(`${this.baseUrl}/app-version`);
  }
  getApiVersion() {
    return this.get(`${this.baseUrl}/version`);
  }
  async setStorage(key: string, value: any) {
    await this.storage.set(`${this.storagePrefix}-${key}`, value);
  }
  async getStorage(key: string) {
    return this.storage.get(`${this.storagePrefix}-${key}`);
  }
  async removeStorage(key: string) {
    this.storage.remove(`${this.storagePrefix}-${key}`);
  }
}
