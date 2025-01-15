import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Network } from '@capacitor/network';
import { ToastController } from '@ionic/angular';
import { CachingService } from './caching.service';
import { HttpOptions, CapacitorHttp } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { AppGlobal } from 'src/app/app.global';

declare const $: any;

@Injectable({
  providedIn: 'root'
})
export class PrivateService {

  baseUrl: string;
  connected = true;

  constructor(private global: AppGlobal,
    private auth: AuthService,
    private caching: CachingService,
    private toast: ToastController) {

    Network.addListener('networkStatusChange', async status => {
      this.connected = status.connected;
    });

    this.baseUrl = `${this.global.Api}/api`;
  }
  public get = async (url: string, forceRefresh = false, skipToken = false, cacheResult = false) => {

    if (!this.connected) {
      this.toast.create({
        message: 'No hay conexión a Internet.',
        duration: 2000,
        color: 'dark',
        position: 'bottom'
      }).then(toast => {
        toast.present();
      });

      return this.caching.getCachedRequest(url)
    }

    if (forceRefresh) {
      return this.callGet(url, skipToken, cacheResult);
    }
    else {
      const storeUrl = `${url}`;
      const storedValue = await this.caching.getCachedRequest(storeUrl);

      if (!storedValue) {
        return this.callGet(url, skipToken, cacheResult);
      }
      else {
        return Promise.resolve(storedValue);
      }
    }
  }
  public post = async (url: string, params: any, forceRefresh = false, skipToken = false, cacheResult = false) => {

    if (!this.connected) {
      this.toast.create({
        message: 'No hay conexión a Internet.',
        duration: 2000,
        color: 'dark',
        position: 'bottom'
      }).then(toast => {
        toast.present();
      });

      return this.caching.getCachedRequest(url)
    }

    if (forceRefresh) {
      return this.callPost(url, params, skipToken, cacheResult);
    }
    else {
      const storeUrl = `${url}/${$.param(params)}`;
      const storedValue = await this.caching.getCachedRequest(storeUrl);

      if (!storedValue) {
        return this.callPost(url, params, skipToken, cacheResult);
      }
      else {
        return Promise.resolve(storedValue);
      }
    }

  }
  private callGet = async (url: string, skipToken: boolean, cacheResult: boolean) => {

    let headers: any = { 'Content-Type': 'application/json' };
    let auth: any;

    // Si necesitamos llamar al servidor sin pasar autorización
    if (!skipToken) {
      auth = await this.auth.getAuth();

      if (auth == null) {
        throw Error('ACCESS_TOKEN_MISSING');
      }

      headers.Authorization = `Bearer ${auth.access_token}`;
    }

    const options: HttpOptions = {
      url: url,
      responseType: 'json',
      headers: headers
    };
    const response = await CapacitorHttp.get(options);

    if (response.status == 200) {
      // Si necesitamos guardar en cache el resultado
      if (cacheResult) {
        const storeUrl = `${url}`;
        this.caching.cacheRequest(storeUrl, response);

        return Object.assign(response, { storeUrl: storeUrl });
      }
      return response;
    }
    else if (response.status == 504) {
      const storedValue = await this.caching.getCachedRequest(url);

      if (storedValue != null) {
        return storedValue;
      }
    }

    return Promise.reject(response);
  }
  private callPost = async (url: string, params: any, skipToken: boolean, cacheResult: boolean) => {
    let headers: any = { 'Content-Type': 'application/json' };
    let auth: any;

    // Si necesitamos llamar al servidor sin pasar autorización
    if (!skipToken) {
      auth = await this.auth.getAuth();

      if (auth == null) {
        throw Error('ACCESS_TOKEN_MISSING');
      }

      headers.Authorization = `Bearer ${auth.access_token}`;
    }

    const options: HttpOptions = {
      url: url,
      responseType: 'json',
      headers: headers,
      data: params
    };
    const response = await CapacitorHttp.post(options);

    if (response.status == 200) {
      // Si necesitamos guardar en cache el resultado
      if (cacheResult) {
        const storeUrl = `${url}/${$.param(params)}`;
        this.caching.cacheRequest(storeUrl, response);

        return Object.assign(response, { storeUrl: storeUrl });
      }
      return response;
    }
    else if (response.status == 504) {
      const storedValue = await this.caching.getCachedRequest(url);

      if (storedValue != null) {
        return storedValue;
      }
    }

    return Promise.reject(response);
  }
  public upload = async (url: string, filepath: string, filename: string, params?: any) => {
    const auth = await this.auth.getAuth();

    if (auth == null) {
      throw Error('ACCESS_TOKEN_MISSING');
    }

    const headers = {
      'Authorization': `Bearer ${auth.access_token}`
    };

    if (params) {
      url = `${url}?${$.param(params)}`;
    }

    return new Promise(async (resolve, reject) => {
      // const request = this.http.uploadFile(url, {}, headers, filepath, 'file');

      // request.then((response: any) => {
      //   response.data = JSON.parse(response.data);
      //   resolve(response);
      // });

      // request.catch((error: any) => {
      //   reject(error)
      // });
    })
  }
  public uploadWeb = async (url: string, data: FormData, params?: any) => {
    const auth = await this.auth.getAuth();

    if (auth == null) {
      throw Error('ACCESS_TOKEN_MISSING');
    }

    if (params) {
      url = `${url}?${$.param(params)}`;
    }

    const options: HttpOptions = {
      url: url,
      responseType: 'json',
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${auth.access_token}`
      },
      data: data
    };
    const response = await CapacitorHttp.post(options);

    if (response.status == 200) {
      return response;
    }

    return Promise.reject(response);
  }
  public removeStoreRequest(url: string) {
    this.caching.invalidateCacheEntry(url);
  }
  marcarVista = async (apesTevento: string, sedeCcod = 0, apesTdescripcion?: string, apesTvalor?: string) => {
    const device = await Device.getId();

    try {
      const params = {
        apesTevento: apesTevento,
        sedeCcod: sedeCcod,
        apesTdescripcion: apesTdescripcion || '',
        apesTvalor: apesTvalor || '',
        apesTdispositivoUuid: device.identifier,
        apesTdispositivoIp: '',
        apesTdispositivoLatLng: '',
        audiTusuario: 'AMD'
      };

      this.post(`${this.baseUrl}/v4/marcar-vista`, params, true, undefined, false);
    }
    catch { }
  }

}
