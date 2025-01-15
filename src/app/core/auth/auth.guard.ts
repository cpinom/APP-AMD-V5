import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AuthPage } from './auth.page';
import { AuthService } from './auth.service';
import { EventsService } from '../services/events.services';
import { Ingreso } from './auth.interfaces';
import { AppGlobal } from '../../app.global';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private modal: ModalController,
    private auth: AuthService,
    private router: Router,
    private events: EventsService,
    private global: AppGlobal) { }

  canActivate(): Promise<boolean> | boolean {
    return this.validate().catch(() => {
      if (this.router.url.indexOf('/publico') == -1) {
        this.router.navigate(['/publico']);
      }
      return false;
    })
  }
  async validate() {
    const tokenValid = await this.auth.tokenValid();

    if (!tokenValid) {
      try {
        const auth = await this.tryLogin();
        const authResult = await this.auth.setAuth(auth);

        if (authResult == true) {
          const ingreso: Ingreso = {
            uuid: this.global.DeviceId
          };
          this.events.onLogin.next(ingreso);

          return Promise.resolve(true);
        } else {
          return Promise.reject();
        }
      }
      catch (error) {
        return Promise.reject();
      }
    } else {
      return Promise.resolve(true);
    }

  }
  async tryLogin() {
    let modal = await this.modal.create({
      component: AuthPage,
      canDismiss: async (data?: any, role?: string) => {
        if (role == 'gesture' || role == 'backdrop') {
          return false;
        }
        return true
      }
    });

    await modal.present();

    const result = await modal.onWillDismiss();

    if (result.data && result.data.access_token) {
      return Promise.resolve(result.data);
    }

    return Promise.reject();
  }

}
