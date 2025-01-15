import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthAccess implements CanActivate {

  constructor(private auth: AuthService, private nav: NavController) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    let url: string = state.url;

    return new Promise(async (resolve, reject) => {
      let valid = await this.auth.tokenValid();

      if (valid) {
        return resolve(true);
      } else {
        await this.nav.navigateBack('/publico');
        return reject();
      }
    });
  }

}
