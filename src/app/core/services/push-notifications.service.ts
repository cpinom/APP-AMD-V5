import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { PushNotifications } from '@capacitor/push-notifications';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';
import { Platform } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService {

  onRegistration = new Subject<string>();
  onRegistrationError = new Subject<any>();

  constructor(private pt: Platform) { }

  init() {

    PushNotifications.addListener('registration', token => {
      this.onRegistration.next(token.value)
    });

    PushNotifications.addListener('registrationError', error => {
      this.onRegistrationError.next(error)
    });

    PushNotifications.requestPermissions().then(async result => {

      if (result.receive == 'granted') {
        PushNotifications.register();
      }
      else if (result.receive == 'denied') {
        if (this.pt.is('ios')) {
          await NativeSettings.openIOS({
            option: IOSSettings.App
          })
        }
      }

    });

  }
}
