import { Injectable } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(private alertCtrl: AlertController,
    private auth: AuthService,
    private navCtrl: NavController) { }

  handle(error: any, cb?: Function) {

    this.alertCtrl.getTop().then(currentAlert => {
      if (currentAlert != null) {
        currentAlert.dismiss();
      }

      if (error && error.status == 401) {
        this.auth.clearAuth();
        this.navCtrl.navigateBack('/publico');
        this.alertCtrl.create({
          keyboardClose: false,
          backdropDismiss: false,
          header: 'La sesión ha caducado',
          message: 'Vuelve a iniciar sesión.',
          buttons: ['Aceptar']
        }).then(alert => alert.present());
      }
      else {
        const message = typeof (error) == 'string' ? error : 'El servicio no se encuentra disponible o presenta algunos problemas de cobertura, reintenta en un momento.';
        
        this.alertCtrl.create({
          keyboardClose: false,
          backdropDismiss: false,
          header: 'INACAP',
          message: message,
          buttons: [{
            text: 'Aceptar',
            handler: () => {
              if (typeof cb == 'function') {
                cb.call(this);
              }
            }
          }]
        }).then(alert => alert.present());
      }

    });

  }

}
