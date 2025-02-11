import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertInput, LoadingController, MenuController, ModalController, NavController, Platform } from '@ionic/angular';
import { AuthService } from 'src/app/core/auth/auth.service';
import { CursoService } from 'src/app/core/services/curso/curso.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { NotificacionesPage } from './notificaciones/notificaciones.page';
import { PerfilPage } from './perfil/perfil.page';
import { AppGlobal } from '../../app.global';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { Preferences } from '@capacitor/preferences';
import { InformacionPage } from '../publico/informacion/informacion.page';
import { UtilsService } from 'src/app/core/services/utils.service';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { EventsService } from 'src/app/core/services/events.services';
import { Subscription, interval } from 'rxjs';
import { DialogService } from 'src/app/core/services/dialog.service';

@Component({
  selector: 'app-privado',
  templateUrl: './privado.page.html',
  styleUrls: ['./privado.page.scss'],
})
export class PrivadoPage implements OnInit, OnDestroy {

  @ViewChild('ramos', { read: ElementRef }) public ramosContent!: ElementRef<any>;
  periodos: any;
  clases: any;
  cursos: any;
  apuntes: any;
  tabModel = 0;
  mostrarData = false;
  mostrarCargando = true;
  mostrarCargando2 = false;
  mostrarError = false;
  periodoForm: FormGroup;
  periodoLabel!: string;
  tabletAsignada: any;
  alertPeriodo = {
    header: 'Período Académico',
    message: 'Seleccione el período que desee visualizar'
  };

  mostrarPin: boolean | undefined;
  mostrarResultadosEvaluacion: boolean | undefined;
  mostrarManual: string | undefined;
  inacapMail: any;
  eventSubscription!: Subscription;
  classSubscription: Subscription | undefined;

  constructor(private nav: NavController,
    private router: Router,
    private menu: MenuController,
    private auth: AuthService,
    private dialog: DialogService,
    private api: CursoService,
    private error: ErrorService,
    private global: AppGlobal,
    private fb: FormBuilder,
    private snackbar: SnackbarService,
    private utils: UtilsService,
    private events: EventsService,
    private pt: Platform) {

    this.periodoForm = this.fb.group({
      periodo: []
    });

    this.periodo?.valueChanges.subscribe((value) => {
      this.guardarPeriodo(value);
    });

    this.eventSubscription = this.events.app.subscribe((event: any) => {
      if (event.action == 'onNotificacion') {
        debugger
        this.notificacionesTap();
      }
    });
  }
  async ionViewDidEnter() {
    let enable = await this.menu.isEnabled('intranet');

    if (!enable) {
      await this.menu.enable(true, 'intranet');
    }

    if (this.clases) {
      await this.recargar();
    } else {
      await this.cargar();
    }

    this.status();
    this.cargarCorreos();
    this.cargarCuentasCorreos();
  }
  ngOnInit() {
    this.global.NotificationFlag = true;
    // this.cargar();
    this.api.marcarVista(VISTAS_DOCENTE.PRINCIPAL);
  }
  ngOnDestroy() {
    this.eventSubscription && this.eventSubscription.unsubscribe();
    this.classSubscription && this.classSubscription.unsubscribe();
  }
  iniciarTareas() {
    this.classSubscription && this.classSubscription.unsubscribe();

    const period = 5000;
    const task = interval(period);

    this.classSubscription = task.subscribe(() => {
      this.verificarEstadoClase();
    });
  }
  async verificarEstadoClase() {
    //debugger
    // await this.recargar();
  }
  async periodoTap() {
    let options: AlertInput[] = [];

    for (let i = 0; i < this.periodos.length; i++) {
      options.push({
        name: 'opcion',
        type: 'radio',
        label: this.periodos[i].periTdesc,
        value: this.periodos[i].periCcod,
        checked: this.periodos[i].periSeleccionado
      });
    }

    await this.dialog.showAlert({
      subHeader: 'Seleccione el período que desee visualizar',
      header: 'Período Académico',
      inputs: options,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        },
        {
          text: 'Actualizar',
          role: 'destructive',
          handler: (periCcod) => {
            if (periCcod) {
              this.guardarPeriodo(periCcod);
            }
          }
        }
      ]
    });
  }
  async guardarPeriodo(periCcod: any) {
    const loading = await this.dialog.showLoading({ message: 'Guardando...' });
    let revertirCambios = false;

    try {
      const params = { periCcod: periCcod };
      const response = await this.api.guardarPeriodo(params);
      const { data } = response;

      if (data.success) {
        await this.cargar(true);
        this.snackbar.showToast(data.message, 3000, 'success');
        this.api.marcarVista(VISTAS_DOCENTE.CURSO_CAMBIA_PERIODO);
      }
      else {
        throw Error();
      }
    }
    catch (error: any) {
      if (error && error.status == 401) {
        this.error.handle(error);
        return
      }
      revertirCambios = true;
      this.snackbar.showToast('No fue posible completar la solicitud.', 3000, 'danger');
    }
    finally {
      await loading.dismiss();
    }

    if (revertirCambios) {
      this.aplicarPeriodo(this.periodos);
    }
  }
  async aplicarPeriodo(periodos: any) {
    const periodo = periodos.filter((t: any) => t.periSeleccionado == true)[0];
    this.periodo?.setValue(periodo.periCcod, { emitEvent: false });
    this.periodoLabel  = periodo.periTdesc;
  }
  async cargar(forceRefresh = false) {
    try {
      const params = { aptaTuuid: this.global.DeviceId };
      const response = await this.api.getPrincipal(params, forceRefresh);
      const { data } = response;

      if (data.success) {
        this.periodos = data.data.periodos;
        this.clases = data.data.clases;
        this.cursos = data.data.cursos;
        this.tabletAsignada = data.data.tabletAsignada;
        this.apuntes = data.data.apuntes;
        this.aplicarPeriodo(this.periodos);
        this.iniciarTareas();

        if (forceRefresh) {
          this.ramosContent.nativeElement.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }
      else {
        this.api.removeStoreRequest(response.storeUrl);
        throw Error();
      }
    }
    catch (error: any) {
      if (error && error.status == 401) {
        this.error.handle(error);
      }
      this.mostrarError = true;
    }
    finally {
      this.mostrarCargando = false;
      this.mostrarData = true;
    }
  }
  async recargar(ev?: any) {

    if (this.mostrarError || ev) {
      this.mostrarCargando = true;
      this.mostrarData = false;
      this.mostrarError = false;

      await this.cargar(true);

      if (ev) {
        ev.target.complete();
      }

      return;
    }

    this.mostrarCargando2 = true;

    try {
      const params = { aptaTuuid: this.global.DeviceId };
      const response = await this.api.getClases(params);
      const { data } = response;

      if (data.success) {
        this.clases = data.clases;
        this.apuntes = data.apuntes;
      }
      else {
        this.api.removeStoreRequest(response.storeUrl);
        throw Error();
      }
    }
    catch (error: any) {
      if (error && error.status == 401) {
        this.error.handle(error);
      }
      if (!this.clases) {
        this.mostrarError = true;
      }
    }
    finally {
      this.mostrarCargando2 = false;
      this.mostrarData = true;
      ev && ev.target.complete();
    }
  }
  async status() {
    try {
      const response = await this.api.getStatus();
      const { data } = response;

      if (data.success) {
        this.mostrarPin = data.mostrarPin === true;
        this.mostrarResultadosEvaluacion = data.mostrarResultadosEvaluacion === true;
        this.mostrarManual = data.mostrarManual;
      }
    }
    catch { }
  }
  async cargarCorreos() {
    try {
      const response = await this.api.getMailSummary();
      const { data } = response;

      if (data.success) {
        this.inacapMail = data.inbox;
      }
    }
    catch (error: any) {
      if (error && error.status == 401) {
        this.error.handle(error);
      }
    }
  }
  async cargarCuentasCorreos() {
    this.api.getCorreos().catch(error => {
      console.log('Error carga cuentas de correos: ', error);
    });
  }
  async pinTap() {
    await this.dialog.showModal({
      component: PerfilPage,
      componentProps: {
        mostrarPin: true
      },
      canDismiss: async (data?: any, role?: string) => {
        if (role == 'gesture' || role == 'backdrop') {
          return false;
        }
        return true
      }
    });
  }
  async mostrarCurso(ev: any, data: any, action?: string) {
    ev.stopPropagation();

    if (action) {
      data = Object.assign(data, { action: action });
    }

    await this.nav.navigateForward(`${this.router.url}/curso`, { state: data });
  }
  async mostrarApunte(ev: any, data: any) {
    ev.stopPropagation();

    await Preferences.set({
      key: 'Apunte',
      value: JSON.stringify(data)
    });
    const seccion = this.cursos.find((t: any) => t.ssecNcorr == data.ssecNcorr);
    await this.nav.navigateForward(`${this.router.url}/curso/apuntes-clases`, { state: seccion });
  }
  async publicoTap(closeMenu?: boolean) {
    closeMenu == true && await this.menu.close();
    await this.nav.navigateBack('/publico');
  }
  async notificacionesTap() {
    await this.dialog.showModal({
      id: 'modal-notificaciones',
      component: NotificacionesPage
    });
  }
  async perfilTap() {
    await this.dialog.showModal({
      component: PerfilPage,
      canDismiss: async (data?: any, role?: string) => {
        if (role == 'gesture' || role == 'backdrop') {
          return false;
        }
        return true
      }
    });
  }
  async comunicacionesTap() {
    await this.nav.navigateForward('privado/comunicaciones');
  }
  async moodleTap() {
    const auth = await this.auth.getAuth();
    const token = encodeURIComponent(auth.private_token);
    const url = `https://siga.inacap.cl/inacap.api.amd.v4/Moodle?user=${auth.user.persNcorr}&token=${token}`;

    this.utils.openLink(url);
    this.api.marcarVista(VISTAS_DOCENTE.AAI);
  }
  async openMenu() {
    await this.menu.open();
  }
  async logout() {
    this.menu.close();
    this.auth.tryLogout();
  }
  manualTap() {
    this.menu.close();
    this.utils.openLink(this.mostrarManual!);
  }
  async versionTap() {
    this.menu.close();

    await this.dialog.showModal({
      component: InformacionPage,
      canDismiss: async (data?: any, role?: string) => {
        if (role == 'gesture' || role == 'backdrop') {
          return false;
        }
        return true
      }
    });
  }
  async politicasTap() {
    this.utils.openLink('https://portales.inacap.cl/politicas-de-privacidad');
  }
  get periodo() { return this.periodoForm.get('periodo'); }
  get appConnected() { return this.global.IsConnected; }
  get appVersion() { return this.global.Version; }
  get mostrarNotificaciones() { return this.global.NotificationFlag; }
}
