import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { DispositivoService } from '../dispositivo.service';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  constructor(private deviceApi: DispositivoService) { }

  async setStorage(key: string, value: any) {
    await Preferences.set({ key: key, value: JSON.stringify(value) })
  }

}
