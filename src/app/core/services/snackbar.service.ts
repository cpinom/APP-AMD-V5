import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  duration: number = 3000

  constructor(private toast: ToastController,
    private snackBar: MatSnackBar) { }
  showSnackbar(message: string, action?: string, duration?: number, color?: string, callback?: Function) {
    const { _openedSnackBarRef } = this.snackBar;

    if (_openedSnackBarRef) {
      _openedSnackBarRef.dismiss();
    }

    const current = this.snackBar.open(message, action, {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      duration: duration || this.duration
    });

    current.onAction().subscribe(action=> {
      //debugger
    })
  }
  async showToast(message: string, duration?: number, color?: string, callback?: Function) {
    const currentToast = await this.toast.getTop();

    currentToast?.dismiss();

    const toast = await this.toast.create({
      message: message,
      duration: duration || this.duration,
      color: color ? color : 'dark',
      keyboardClose: true,
      buttons: [{
        text: 'Cerrar',
        side: 'end',
        handler() {
          callback && callback();
        },
      }]
    });

    await toast.present();

    return toast;
  }
  async create(message: string, closable: boolean, color?: string) {
    this.toast.getTop().then(currentToast => {
      currentToast && currentToast.dismiss();
    });

    const buttons = closable ? [{
      role: 'cancel',
      icon: 'close',
      handler: () => { }
    }] : [];

    const toast = await this.toast.create({
      message: message,
      color: color || 'dark',
      buttons: buttons,
      //duration: 3000
    });

    return toast;
  }
}
