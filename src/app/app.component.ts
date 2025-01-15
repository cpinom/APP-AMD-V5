import { Component, NgZone } from '@angular/core';
import { AlertController, Config, ModalController, NavController, Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { Device } from '@capacitor/device';
import { register } from 'swiper/element/bundle';
import { Subscription, interval } from 'rxjs';
import { Network } from '@capacitor/network';
import { AppGlobal } from './app.global';
import { DispositivoService } from './core/services/dispositivo.service';
import { EventsService } from './core/services/events.services';
import { Ingreso, Salida } from './core/auth/auth.interfaces';
import { PerfilService } from './core/services/perfil.service';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { CachingService } from './core/services/caching.service';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';
import { PushNotificationsService } from './core/services/push-notifications.service';
import { AuthService } from './core/auth/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { CursoService } from './core/services/curso/curso.service';
import { AppLauncher } from '@capacitor/app-launcher';
import { PublicoService } from './core/services/publico.service';
import { PushNotifications } from '@capacitor/push-notifications';
// import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';

declare const $: any;

register();
initializeApp(environment.firebase);

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  batterySubs: Subscription | undefined;

  constructor(private platform: Platform,
    private global: AppGlobal,
    private config: Config,
    private api: DispositivoService,
    private publicApi: PublicoService,
    private perfil: PerfilService,
    private events: EventsService,
    private caching: CachingService,
    private push: PushNotificationsService,
    private auth: AuthService,
    private modal: ModalController,
    private router: Router,
    private cursos: CursoService,
    private nav: NavController,
    private alertCtrl: AlertController,
    private zone: NgZone) {
    this.initializeApp();
  }
  async initializeApp() {
    await this.platform.ready();

    App.addListener('appStateChange', status => {
      this.onAppStateChange(status.isActive);
    });

    this.router.events.subscribe(this.onRouterEvents.bind(this));
    this.events.onLogin.subscribe(this.onAppLogin.bind(this));
    this.events.onLogout.subscribe(this.onAppLogout.bind(this));
    this.caching.initStorage();

    await this.deviceSetup();
    await this.accessibilitySetup();
    await this.createCacheFolder();

    if (this.platform.is('capacitor')) {
      await this.notificactionsSetup();
      await StatusBar.setStyle({ style: Style.Dark });

      if (this.platform.is('ios')) {
        await Keyboard.setAccessoryBarVisible({ isVisible: true });
      }
    }
    else {
      await this.notificacionsWeb();
    }

    this.validateVersion();
  }
  async onAppStateChange(isActive: boolean) {
    if (isActive) {
      const auth = await this.auth.getAuth();
      const tokenValid = await this.auth.tokenValid();

      if (auth && !tokenValid) {
        this.perfil.registrarSalida({ uuid: this.global.DeviceId });
        this.nav.navigateBack('/publico');
      }
    }
  }
  async onAppLogin(usuario: Ingreso) {
    this.perfil.registrarAcceso({ uuid: usuario.uuid }).catch(() => { });

    try {
      const response = await this.perfil.preferencias();
      let preferencias = response.data;

      if (!preferencias.movil || typeof (preferencias.movil) == 'string') {
        preferencias = {
          "oscuro": ('oscuro' in preferencias) ? preferencias.oscuro : false,
          "movil": {
            "sincronizar_calendario": false,
            "contraste": 0,
            "font_size": 0,
            "font_range": 2,
            "oscuro_automatico": 0
          }
        };
      }

      if (!('oscuro_automatico' in preferencias.movil)) {
        preferencias.movil["oscuro_automatico"] = 0;
      }

      await this.perfil.setStorage('preferencias', preferencias);
    }
    catch { }

    this.accessibilitySetup();
  }
  async onAppLogout(usuario: Salida) {
    this.clearCacheFolder();
    this.cursos.clearStorage();
    this.perfil.clearStorage();
    this.perfil.toggleBodyClass('dark', true);
    this.perfil.registrarSalida({ uuid: usuario.uuid }).catch(() => { });
  }
  async onRouterEvents(val: any) {
    if (val instanceof NavigationEnd) {
      const currentModal = await this.modal.getTop();

      if (currentModal) {
        await currentModal.dismiss();
      }
    }
  }
  async deviceSetup() {
    try {
      const minutes = 3;
      const task = interval(1000 * 60 * minutes);
      const device = await Device.getId();
      const connection = await Network.getStatus();

      this.global.DeviceId = device.identifier;
      this.global.IsConnected = connection.connected == true;
      this.batterySubs = task.subscribe(() => this.batteryInfo());
      this.batteryInfo();
      this.networkSetup();

      if (this.platform.is('mobileweb')) {
        this.global.IsApple = this.config.get('mode') == 'ios';
      } else {
        this.global.IsApple = this.platform.is('ios');
      }
    }
    catch (error) { }
  }
  networkSetup() {
    Network.addListener('networkStatusChange', status => {
      this.global.IsConnected = status.connected == true;

      if (status.connected) {
        $('body').addClass('on-line');
        $('body').removeClass('off-line');

        setTimeout(() => {
          $('body').removeClass('on-line');
        }, 2000);
      } else {
        $('body').addClass('off-line');
      }

      if (status.connectionType == 'none') {
        $('body').addClass('off-line');
      }
    });
  }
  async batteryInfo() {
    try {
      let info = await Device.getBatteryInfo();
      let isCharging = info.isCharging;

      // if (this.platform.is('mobileweb')) {
      //   isCharging = false;
      // }

      if (this.global.IsConnected && !isCharging) {
        const batteryLevel = info.batteryLevel! * 100;
        const params = { estaNporc: batteryLevel, aptaTuuid: this.global.DeviceId };

        try {
          await this.api.actualizarBateriaTablet(params);
        }
        catch (error) {
          console.log('Error actualizando bateria: ', error);
        }
      }
    }
    catch (error) {
      console.log('Error obteniendo info bateria: ', error);
    }
  }
  async accessibilitySetup() {
    // debugger
    // if (this.platform.is('mobileweb')) {
    //   return;
    // }

    try {
      let tokenValid = await this.auth.tokenValid();
      let preferencias = await this.perfil.getStorage('preferencias');

      if (tokenValid && preferencias) {
        let contrastMode = preferencias.movil["contraste"] == 1;
        let fontSizeMode = preferencias.movil["font_size"] == 1;
        let fontSizeRange = preferencias.movil["font_range"];
        let darkMode = preferencias.oscuro == true;

        preferencias.movil.oscuro_automatico = 0;

        if (fontSizeMode) {
          this.perfil.applyFontSize(fontSizeRange);
        }
        document.body.classList.toggle('dark', darkMode);
        document.body.classList.toggle('contrast', contrastMode);
        await this.perfil.setStorage('preferencias', preferencias);
      }
    }
    catch { }
  }
  async notificactionsSetup() {

    this.push.onRegistration.subscribe(async (currentToken: string) => {
      // debugger
      const info = await Device.getInfo();

      await this.api.registrarDispositivo({
        token: currentToken,
        plataforma: info.platform,
        modelo: info.model,
        uuid: this.global.DeviceId,
        version: info.osVersion
      });

    });

    this.push.onRegistrationError.subscribe((error: any) => {
      debugger
    });

    this.push.init();

    PushNotifications.addListener('pushNotificationReceived', async (notification: any) => {
      let scheduleAt = new Date();
      scheduleAt.setSeconds(scheduleAt.getSeconds() + 1);

      // const opts: ScheduleOptions = {
      //   notifications: [{
      //     title: notification.title,
      //     id: 1,
      //     body: notification.body,
      //     schedule: { at: scheduleAt }
      //   }]
      // };

      // await LocalNotifications.schedule(opts);

      this.zone.run(() => {
        this.global.NotificationFlag = true;
        this.events.app.next({ action: 'onNotificacionRecibida' });
      });
    });

    PushNotifications.addListener('pushNotificationActionPerformed', async (notification: any) => {
      const tokenValid = await this.auth.tokenValid();

      if (tokenValid) {
        if (this.router.url.indexOf('/privado') == -1) {
          await this.router.navigate(['/privado']);
        }

        const currentModal = await this.modal.getTop();

        if (currentModal && currentModal.id == 'modal-notificaciones') {
          return;
        }

        this.events.app.next({ action: 'onNotificacion' });
      }
    });

    // LocalNotifications.addListener('localNotificationActionPerformed', async (notification: any) => {
    //   const tokenValid = await this.auth.tokenValid();

    //   if (tokenValid) {
    //     if (this.router.url.indexOf('/privado') == -1) {
    //       await this.router.navigate(['/privado']);
    //     }

    //     const currentModal = await this.modal.getTop();

    //     if (currentModal && currentModal.id == 'modal-notificaciones') {
    //       return;
    //     }

    //     this.events.app.next({ action: 'onNotificacion' });
    //   }
    // });

  }
  async notificacionsWeb() {
    const messaging = getMessaging();
    const options = { vapidKey: environment.firebase.vapidKey };

    try {
      const currentToken = await getToken(messaging, options);

      if (currentToken) {
        const info = await Device.getInfo();

        await this.api.registrarDispositivo({
          token: currentToken,
          plataforma: info.platform,
          modelo: info.model,
          uuid: this.global.DeviceId,
          version: info.osVersion
        });
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    }
    catch (err) {
      // debugger
      console.log('An error occurred while retrieving token. ', err);
    }

    onMessage(messaging, (payload) => {
      this.global.NotificationFlag = true;
      alert(payload.notification?.body);
      console.log('Message received. ', payload);
    })
  }
  async createCacheFolder() {
    try {
      await Filesystem.mkdir({
        directory: Directory.Cache,
        path: 'CACHED-IMG'
      });
    }
    catch { }
  }
  async clearCacheFolder() {
    try {
      const filesCache = await Filesystem.readdir({
        directory: Directory.Cache,
        path: 'CACHED-IMG'
      });

      filesCache.files.forEach(async file => {
        await Filesystem.deleteFile({
          path: file.uri
        })
      });
    }
    catch { }
  }
  async validateVersion() {
    try {
      const versionExp = /^(?:(\d+)\.){2}(\*|\d+)$/;
      const response = await this.publicApi.getAppVersion();
      const { data } = response;

      if (data.success) {
        if (versionExp.test(data.version)) {
          let compareResult = this.versionCompare(this.global.Version, data.version);

          if (!compareResult) {
            await this.presentAlertUpdate();
          }
        }
      }
    }
    catch { }
  }
  versionCompare(myVersion: string, minimumVersion: string) {
    let v1 = myVersion.split(".");
    let v2 = minimumVersion.split(".");
    let minLength;

    minLength = Math.min(v1.length, v2.length);

    for (let i = 0; i < minLength; i++) {
      if (Number(v1[i]) > Number(v2[i])) {
        return true;
      }
      if (Number(v1[i]) < Number(v2[i])) {
        return false;
      }
    }

    return (v1.length >= v2.length);
  }
  async presentAlertUpdate() {
    let alert = await this.alertCtrl.create({
      header: 'Actualización Requerida',
      message: 'Una actualización es requerida para continuar.',
      buttons: [
        {
          text: 'Salir'
        },
        {
          text: 'Actualizar',
          role: 'destructive',
          handler: () => {
            this.openInAppStore();
          }
        }
      ]
    });

    await alert.present();
  }
  async presentAlertCasaCentral() {
    let alert = await this.alertCtrl.create({
      header: 'Actualización Requerida',
      message: 'Favor contactarse al correo electrónico - cpinom@inacap.cl',
      buttons: [
        {
          text: 'Salir'
        },
        {
          text: 'Aceptar',
          role: 'destructive'
        }
      ]
    });

    await alert.present();
  }
  openInAppStore() {
    if (this.platform.is('ios')) {
      AppLauncher.openUrl({ url: 'itms-apps://itunes.apple.com/app/1232228033' });
    } else {
      this.presentAlertCasaCentral()
    }
  }

}
