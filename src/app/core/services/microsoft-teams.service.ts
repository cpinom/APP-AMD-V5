import { Injectable } from '@angular/core';
import { PrivateService } from './private.service';
import { AppGlobal } from '../../app.global';
import { AuthService } from '../auth/auth.service';
import { CachingService } from './caching.service';
import { ToastController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class MicrosoftTeamsService extends PrivateService {

  constructor(global: AppGlobal,
    auth: AuthService,
    caching: CachingService,
    toast: ToastController,
    ) {
    super(global, auth, caching, toast);
  }

  getEventos(forceRefresh = false) {
    return this.get(`${this.baseUrl}/microsoft-teams/v2/eventos`, forceRefresh, undefined, true);
  }
  getEventosV3(pageSize: any, skip: any) {
    return this.get(`${this.baseUrl}/microsoft-teams/v3/eventos?pageSize=${pageSize}&skip=${skip}`)
  }
  eliminarEvento(params: any) {
    return this.post(`${this.baseUrl}/microsoft-teams/v2/eliminar-evento`, params);
  }

}
