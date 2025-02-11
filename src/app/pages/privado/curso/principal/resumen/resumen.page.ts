import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { ActionSheetController, AlertController, IonModal, IonNav, ModalController, NavController, Platform } from '@ionic/angular';
import * as moment from 'moment';
import { CursoService } from 'src/app/core/services/curso/curso.service';
import { ActualizarAsistenciaPage } from '../actualizar-asistencia/actualizar-asistencia.page';
import { AprendizajesEsperadosPage } from '../aprendizajes-esperados/aprendizajes-esperados.page';
import { AsesorPedagogicoPage } from '../asesor-pedagogico/asesor-pedagogico.page';
import { CambiarSalaPage } from '../cambiar-sala/cambiar-sala.page';
import { RiesgosAlumnosPage } from '../riesgos-alumnos/riesgos-alumnos.page';
import { SoporteTecnicoPage } from '../soporte-tecnico/soporte-tecnico.page';
import { Geolocation } from '@capacitor/geolocation';
import { AppGlobal } from '../../../../../app.global';
import { ErrorService } from 'src/app/core/services/error.service';
import { DistribucionNotasPage } from '../distribucion-notas/distribucion-notas.page';
import { Camera } from '@capacitor/camera';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { Subscription, interval } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Haptics } from '@capacitor/haptics';
import { OportunidadesAlumnosPage } from '../oportunidades-alumnos/oportunidades-alumnos.page';
import { TiposAlumnosPage } from '../tipos-alumnos/tipos-alumnos.page';
import { PerfilAlumnosPage } from '../perfil-alumnos/perfil-alumnos.page';
import { AsignaturasPrerequisitosPage } from '../asignaturas-prerequisitos/asignaturas-prerequisitos.page';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { BarcodeScanningModalComponent } from 'src/app/core/components/barcode-scanning-modal/barcode-scanning-modal.component';
import { DialogService } from 'src/app/core/services/dialog.service';
import { Barcode, BarcodeFormat, LensFacing } from '@capacitor-mlkit/barcode-scanning';
import { UtilsService } from 'src/app/core/services/utils.service';

enum FORMA_COMENZAR {
  VALIDA_SALA = 1,
  NO_VALIDA_SALA = 2
};

enum ESTADO_CLASES {
  POR_INICIAR = 1,
  INICIADA = 2,
  TERMINADA = 3
}

@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.page.html',
  styleUrls: ['./resumen.page.scss'],
})
export class ResumenPage implements OnInit, OnDestroy {

  tiposEstudiantesCharts: any;
  perfilesEstudiantesCharts: any;

  @ViewChild('terminarMdl') terminarMdl!: IonModal;
  resumen: any;
  seccion: any;
  estadoClase: any;
  deshabilitarIniciar!: boolean;
  horario: any;
  semanaTitulo!: string;
  semanaActual: any;
  cargandoHorario = false;
  subscription: Subscription | undefined;
  asistenciaForm: FormGroup;
  motivos = [
    { value: 1, text: 'Clase sin Estudiantes' },
    { value: 2, text: 'Clase Tutoría' },
    { value: 3, text: 'Otro' }
  ];
  patternStr = '^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ!@#\n\r\$%\^\&*\ \)\(+=,._-\'\"]+$';
  mostrarResumen = false;

  constructor(private alertCtrl: AlertController,
    private api: CursoService,
    private nav: NavController,
    private nav2: IonNav,
    private modalCtrl: ModalController,
    private global: AppGlobal,
    private error: ErrorService,
    private snackbar: SnackbarService,
    private pt: Platform,
    private dialog: DialogService,
    private fb: FormBuilder,
    private action: ActionSheetController,
    private utils: UtilsService) {

    moment.locale('es');

    this.asistenciaForm = this.fb.group({
      motivo: ['', Validators.required],
      justificacion: ['']
    });

    this.asistenciaForm.get('motivo')?.valueChanges.subscribe((value: number) => {
      const control = this.asistenciaForm.get('justificacion');

      if (value == 3) {
        control?.setValidators([
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(2000),
          Validators.pattern(this.patternStr)
        ]);
      }
      else {
        control?.setValue('');
        control?.clearValidators();
      }

      control?.updateValueAndValidity();
    });

  }
  ngOnDestroy() {
    this.terminarTareas();
  }
  ngOnInit() {
    Preferences.get({ key: 'Seccion' }).then((result) => {
      this.seccion = JSON.parse(result.value!);

      if (this.seccion.estadoLibro > 0) {
        this.estadoClase = this.seccion.estado;
      }

      if (this.seccion.action) {
        if (this.seccion.action == 'INICIAR') {
          this.comenzarClase();
        }
        if (this.seccion.action == 'TERMINAR') {
          this.terminarClase();
        }
        this.seccion.action = undefined;
      }

      this.cargar();
    });
  }
  async ionViewDidEnter() {
    this.iniciarTareas();

    // this.estadoClase = {
    //   estadoLibro: 1,
    //   horaInicio: '',
    //   horaTermino: '',
    //   porcentajeEnClase: 30,
    //   tiempoEnClase: '15 min',
    //   salaActual: 'A101',
    //   estadoSoporte: 0
    // }
  }
  async cargar(forceRefresh = false) {
    await this.cargarHorario();
    await this.cargarResumen(forceRefresh);
    await this.recargarEstadoClase();
  }
  recargar(ev: any) {
    this.cargar(true).finally(() => {
      ev.target.complete();
    });
  }
  iniciarTareas() {
    if (this.seccion.estadoLibro == ESTADO_CLASES.POR_INICIAR || this.seccion.estadoLibro == ESTADO_CLASES.INICIADA) {
      if (this.subscription && !this.subscription.closed) {
        this.subscription.unsubscribe();
      }

      const period = this.pt.is('mobileweb') ? 5000 : 30000;
      const task = interval(period);
      this.subscription = task.subscribe(() => {
        this.recargarEstadoClase();
      });
    }
  }
  terminarTareas() {
    this.subscription && this.subscription.unsubscribe();
  }
  async recargarEstadoClase(force = false) {
    if (this.seccion.estadoLibro == 0) {
      return;
    }

    if (force == false) {
      const currentAlert = await this.alertCtrl.getTop();
      const currentModal = await this.modalCtrl.getTop();

      if (currentAlert) {
        return;
      }

      if (currentModal) {
        return;
      }

      if (this.estadoClase.estadoLibro == ESTADO_CLASES.TERMINADA) {
        return;
      }
    }

    // No mostramos error en caso de falla por el lado del servidor
    try {
      const params = { lclaNcorr: this.seccion.lclaNcorr };
      const response = await this.api.getEstadoClase(params);
      const { data } = response;

      if (data.success) {
        this.estadoClase = data.estado;
      }
    }
    catch { }
  }
  async comenzarClase() {
    const formaComenzar = await this.resolverFormaComenzar();

    if (formaComenzar == FORMA_COMENZAR.VALIDA_SALA) {
      await this.validarSala(true);
    }
    else if (formaComenzar == FORMA_COMENZAR.NO_VALIDA_SALA) {
      await this.validarSala(false);
    }
  }
  async confirmarSala(codigoValido: boolean, salaCcodEjecucion?: number) {
    debugger
    const loading = await this.dialog.showLoading({ message: 'Iniciando...' });

    const params = {
      lclaNcorr: this.seccion.lclaNcorr,
      lclaBsalaConfirmada: codigoValido ? 1 : 0,
      salaCcodEjecucion: salaCcodEjecucion,
      aptaTuuid: this.global.DeviceId,
      lcmoNlatitud: null,
      lcmoNlongitud: null
    };

    try {
      const response = await this.api.iniciarClase(params);
      const { data } = response;

      await loading.dismiss();

      if (data.success) {
        this.estadoClase = data.estadoClase;
        this.iniciarTareas();
        this.nav.navigateForward('/privado/curso/registro-asistencia');
        this.api.marcarVista(VISTAS_DOCENTE.CURSO_INICIA_CLASE);
      }
      else {
        await this.presentFail(data.message);
        await this.hapticsVibrate();
      }
    }
    catch (error: any) {
      if (error && error.status == 401) {
        this.error.handle(error);
        return;
      }

      await this.snackbar.showToast('Ha ocurrido un error mientras se iniciaba la clase.', 3000, 'danger');
    }
    finally {
      this.deshabilitarIniciar = false;
      loading.dismiss();
    }
  }
  async resolverFormaComenzar() {
    return new Promise(async (resolve) => {

      await this.dialog.showAlert({
        keyboardClose: false,
        backdropDismiss: false,
        header: 'Comenzar Clase',
        message: `Para comenzar la clase debe confirmar la sala ${this.seccion.salaTdesc}.`,
        buttons: [
          {
            text: 'Validar Sala',
            role: 'destructive',
            handler: () => {
              resolve(FORMA_COMENZAR.VALIDA_SALA);
            }
          },
          {
            text: 'Iniciar Clase sin validar',
            handler: () => {
              resolve(FORMA_COMENZAR.NO_VALIDA_SALA);
            }
          },
          {
            text: 'Cancelar',
            handler: () => {
              resolve(false);
            }
          }
        ]
      });

    });
  }
  async validarSala(validar: boolean) {
    this.deshabilitarIniciar = true;

    if (validar === true) {
      let salaCcod = 0;

      if (this.pt.is('capacitor')) {
        let permission = await Camera.checkPermissions();

        if (permission.camera == 'denied' || permission.camera == 'prompt') {
          permission = await Camera.requestPermissions({ permissions: ['camera'] });
        }

        if (permission.camera == 'granted') {
          const barcode = await this.escanearQR();

          if (barcode) {
            if (barcode.format == BarcodeFormat.QrCode) {
              const regex = /^\d{1,4}$/;
              const validString = regex.test(barcode.rawValue);

              if (validString) {
                salaCcod = Number(barcode.rawValue);
              }
              else {
                await this.snackbar.showToast('El código QR no es válido. Vuelva a intentar.');
              }
            }
            else {
              await this.snackbar.showToast('Debe posicionar la cámara en frente de un código tipo QR.');
            }
          }
        }
        else {
          await this.utils.showAlertCamera();
        }
      }
      else {
        const barcode = await this.escanearQR();
        debugger

        if (!barcode) {
          salaCcod = 3063; // cambio de sala local
        }
      }

      if (salaCcod > 0) {
        const loading = await this.dialog.showLoading({ message: 'Validando...' });
        const params = {
          salaCcod: salaCcod,
          salaTdesc: this.seccion.salaTdesc,
          sedeCcod: this.seccion.sedeCcod
        };

        try {
          const response = await this.api.validarSala(params);
          const { data } = response;

          if (data.success) {
            let message = `El código QR es válido y corresponde a la sala: ${this.seccion.salaTdesc}`;

            if (data.validaSala === false) {
              message = `El código QR no es válido - Intentar nuevamente. Su sala planificada es ${this.seccion.salaTdesc}. Si la ubicación es correcta, seleccione SI`;
            }

            await loading.dismiss();

            const confirmar = await this.confirmarCodigo(message);

            if (confirmar === true) {
              await this.confirmarSala(true, salaCcod);
            }
            else {
              this.iniciarTareas();
            }
          }
          else {
            throw Error();
          }
        }
        catch (error: any) {
          if (error && error.status == 401) {
            this.error.handle(error);
            return;
          }

          this.snackbar.showToast('No se pudo realizar la validación de la Sala. Vuelva a intentar.');
        }
        finally {
          loading.dismiss();
        }
      }
    }
    else if (validar === false) {
      await this.confirmarSala(false, 0);
    }

    this.deshabilitarIniciar = false;
  }
  async escanearQR() {
    return new Promise<Barcode | undefined>(async resolve => {
      const element = await this.dialog.showModal({
        component: BarcodeScanningModalComponent,
        cssClass: 'barcode-scanning-modal',
        showBackdrop: false,
        componentProps: {
          formats: [BarcodeFormat.QrCode],
          lensFacing: LensFacing.Back,
        },
        animated: false
      });

      element.onDidDismiss().then((result) => {
        const barcode: Barcode | undefined = result.data?.barcode;
        if (barcode) {
          resolve(barcode)
        }
        else {
          resolve(undefined)
        }
      })
    });
  }
  async confirmarCodigo(mensaje: string) {
    return new Promise(async (resolve) => {

      await this.dialog.showAlert({
        keyboardClose: false,
        backdropDismiss: false,
        header: '¿Confirmar el código?',
        message: mensaje,
        cssClass: 'confirmar-codigo',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
              resolve(false);
            }
          },
          {
            text: 'Sí, confirmar',
            role: 'destructive',
            handler: () => {
              resolve(true);
            }
          }
        ]
      });

    });
  }
  async terminarClase() {
    if (this.estadoClase.estadoAsistencia == 0) {
      this.terminarMdl.present();
      return;
    }

    await this.dialog.showAlert({
      keyboardClose: false,
      backdropDismiss: false,
      header: 'Terminar Clase',
      message: '¿Esta seguro que desea terminar la clase?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Terminar Clase',
          role: 'destructive',
          handler: this.confirmaTerminarClase.bind(this)
        }
      ]
    });

  }
  async terminarClaseSinAsistencia() {
    if (this.asistenciaForm.valid) {
      let lcmoTcomentario = '';

      if (this.asistenciaForm.get('motivo')?.value == 3) {
        lcmoTcomentario = this.asistenciaForm.get('justificacion')?.value;
      }
      else {
        lcmoTcomentario = this.motivos.find((t: any) => t.value == this.asistenciaForm.get('motivo')?.value)?.text!;
      }

      this.confirmaTerminarClase(lcmoTcomentario);
    }
    else {
      this.asistenciaForm.markAllAsTouched();
    }
  }
  async confirmaTerminarClase(lcmoTcomentario = '') {
    const loading = await this.dialog.showLoading({ message: 'Terminando...' });

    // await loading.present();

    // let permission = await Geolocation.checkPermissions();
    // let coordinates: any = undefined;

    // if (permission.location == 'denied' || permission.location == 'prompt') {
    //   if (this.pt.is('capacitor')) {
    //     permission = await Geolocation.requestPermissions();
    //   }
    // }

    // try {
    //   coordinates = await Geolocation.getCurrentPosition();
    // }
    // catch { }

    // const params = {
    //   lclaNcorr: this.seccion.lclaNcorr,
    //   aptaTuuid: this.global.DeviceId,
    //   lcmoNlatitud: coordinates ? coordinates.coords.latitude : null,
    //   lcmoNlongitud: coordinates ? coordinates.coords.longitude : null,
    //   lcmoTcomentario: lcmoTcomentario
    // };

    const params = {
      lclaNcorr: this.seccion.lclaNcorr,
      aptaTuuid: this.global.DeviceId,
      lcmoNlatitud: null,
      lcmoNlongitud: null,
      lcmoTcomentario: lcmoTcomentario
    };

    if (this.terminarMdl) {
      await this.terminarMdl.dismiss();
    }

    try {
      const response = await this.api.terminarClase(params);
      const { data } = response;

      if (data.success) {
        await this.presentSuccess('Clase finalizada correctamente.');
        this.estadoClase = data.estadoClase;
        this.iniciarTareas();
        this.api.marcarVista(VISTAS_DOCENTE.CURSO_TERMINA_CLASE);
      }
      else {
        await this.snackbar.showToast(data.message, 3000, 'danger');
      }
    }
    catch (error: any) {
      if (error && error.status == 401) {
        this.error.handle(error);
        return;
      }

      this.snackbar.showToast('Ha ocurrido un error mientras se iniciaba la clase.', 3000, 'danger');
    }
    finally {
      this.deshabilitarIniciar = false;
      loading.dismiss();
    }
  }
  async mostrarAprendizajes() {
    await this.nav2.push(AprendizajesEsperadosPage)
  }
  async cambiarSala() {
    const loading = await this.dialog.showLoading({ message: 'Espere...' });

    try {
      const lclaNcorr = this.seccion.lclaNcorr;//{ salaCcod: this.seccion.salaCcod, sedeCcod: this.seccion.sedeCcod, lclaNcorr: this.seccion.lclaNcorr };
      const sedeCcod = this.seccion.sedeCcod;
      const salaCcod = this.seccion.salaCcod;
      const response = await this.api.getSalasSedeV5(lclaNcorr, sedeCcod, salaCcod);
      const { data } = response;

      if (data.success) {
        await loading.dismiss();

        const cambioSalaMdl = await this.modalCtrl.create({
          component: CambiarSalaPage,
          componentProps: {
            salas: data.salas,
            movimientos: data.movimientos,
            libro: this.seccion.lclaNcorr,
            estadoClase: this.estadoClase
          }
        });

        cambioSalaMdl.onWillDismiss().then(result => {
          if (result.data) {
            this.estadoClase = result.data;
          }
        })

        await cambioSalaMdl.present();
      }
    }
    catch (error: any) {
      if (error && error.status == 401) {
        this.error.handle(error);
        return;
      }

      await this.snackbar.showToast('No pudimos cargar la información. Vuelva a intentar.', 3000, 'danger');
    }
    finally {
      await loading.dismiss();
    }
  }
  async soporteTecnico() {
    const loading = await this.dialog.showLoading({ message: 'Espere...' });

    try {
      const params = { lclaNcorr: this.seccion.lclaNcorr, sedeCcod: this.seccion.sedeCcod };
      const response = await this.api.getTicketsSoporte(params);
      const { data } = response;

      if (data.success) {
        loading.dismiss();

        const soporteTiMdl = await this.modalCtrl.create({
          component: SoporteTecnicoPage,
          componentProps: {
            id: data.id,
            tipos: data.tipos,
            libro: this.seccion.lclaNcorr
          }
        });

        soporteTiMdl.onWillDismiss().then(result => {
          if (result.data) {
            this.estadoClase = result.data;
          }
        })

        await soporteTiMdl.present();
      }
    }
    catch (error: any) {
      if (error && error.status == 401) {
        this.error.handle(error);
        return;
      }
      this.snackbar.showToast('No pudimos cargar la información. Vuelva a intentar.', 3000, 'danger');
    }
    finally {
      loading.dismiss();
    }
  }
  async cancelarTicket() {
    let message = 'La solicitud se encuentra en estado Pendiente. ¿Desea cancelar la solicitud?';

    if (this.estadoClase.estadoSoporte == 9) {
      message = 'El equipo de soporte de su sede informa que van en camino. ¿Desea cancelar la solicitud?';
    }

    const actionSheet = await this.action.create({
      header: message,
      buttons: [
        {
          text: 'Sí, Cancelar Solicitud',
          role: 'destructive',
          handler: async () => {
            this.procesarCancelarTicket();
            return true;
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }
  async procesarCancelarTicket() {
    const loading = await this.dialog.showLoading({ message: 'Cancelando solicitud...' });
    const params = { lclaNcorr: this.seccion.lclaNcorr };

    try {
      const response = await this.api.cancelarTicket(params);
      const { data } = response;

      if (data.success) {
        this.estadoClase = data.estado;
        await loading.dismiss();
        await this.snackbar.showToast('Su solicitud ha sido cancelada correctamente.', 3000, 'success');
      }
      else {
        throw Error();
      }
    }
    catch (error: any) {
      if (error && error.status == 401) {
        this.error.handle(error);
        return;
      }

      await this.snackbar.showToast('No pudimos cancelar su solicitud. Vuelva a intentar.', 3000, 'danger')
    }
    finally {
      await loading.dismiss();
    }
  }
  async actualizarAsistencia(mdlTerminar?: IonModal) {
    if (mdlTerminar) {
      await mdlTerminar.dismiss();
    }

    const asistenciaMdl = await this.modalCtrl.create({
      component: ActualizarAsistenciaPage
    });

    await asistenciaMdl.present();

    asistenciaMdl.onWillDismiss().finally(() => {
      this.recargarEstadoClase(true);
    })
  }
  async cargarResumen(forceRefresh: boolean) {
    try {
      let params = {
        periCcod: this.seccion.periCcod,
        seccCcod: this.seccion.seccCcod,
        ssecNcorr: this.seccion.ssecNcorr,
        asigCcod: this.seccion.asigCcod
      };

      const response = await this.api.getResumenSeccion(params, forceRefresh);
      const { data } = response;

      if (data.success) {
        this.resumen = data.resumen;
        this.procesarCharts();
      }
      else {
        this.api.removeStoreRequest(response.storeUrl);
        throw Error();
      }
    }
    catch (error: any) {
      debugger
      if (error && error.status == 401) {
        this.error.handle(error);
        return;
      }
    }
    finally {
      this.mostrarResumen = true;
    }
  }
  async cargarHorario() {
    this.cargandoHorario = true;

    if (!this.semanaActual) {
      if (this.seccion.lclaFclase) {
        this.semanaActual = moment(this.seccion.lclaFclase, 'DD/MM/YYYY').startOf('week');
      } else {
        this.semanaActual = moment().startOf('week');
      }
    }

    let fechaInicio = this.semanaActual;
    let fechaTermino = fechaInicio.clone().add('6', 'days');

    if (fechaInicio.isSame(fechaTermino, 'month')) {
      this.semanaTitulo = `Semana del ${fechaInicio.format('D')} al ${fechaTermino.format('D [de] MMMM')}, ${fechaTermino.format('YYYY')}`;
    } else {
      this.semanaTitulo = `Semana del ${fechaInicio.format('D [de] MMMM')} al ${fechaTermino.format('D [de] MMMM')}, ${fechaTermino.format('YYYY')}`;
    }

    let params = {
      seccCcod: this.seccion.seccCcod,
      ssecNcorr: this.seccion.ssecNcorr,
      fechaInicio: fechaInicio.format('DD/MM/YYYY'),
      fechaTermino: fechaTermino.format('DD/MM/YYYY')
    };

    try {
      const response = await this.api.getHorarioSeccion(params);
      const { data } = response;

      if (data.success) {
        this.horario = data.horario;
      }
      else {
        this.api.removeStoreRequest(response.storeUrl);
        throw Error();
      }
    }
    catch (error: any) {
      if (error && error.status == 401) {
        this.error.handle(error);
        return;
      }
    }
    finally {
      this.cargandoHorario = false;
    }
  }
  procesarCharts() {
    let tiposLabels: any[] = [];
    let tiposData: number[] = [];

    this.resumen.tipos.forEach((item: any) => {
      tiposLabels.push(item.label);
      tiposData.push(item.value);
    });

    this.tiposEstudiantesCharts = {
      labels: tiposLabels,
      dataset: [{
        data: tiposData,
        backgroundColor: ['#283593', '#00bfa5'],
        label: 'Distribución de Estudiantes por Tipo'
      }]
    };

    let perfilesLabels: any[] = [];
    let perfilesData: number[] = [];

    this.resumen.perfiles.forEach((item: any) => {
      perfilesLabels.push(item.label);
      perfilesData.push(item.value);
    });

    this.perfilesEstudiantesCharts = {
      labels: perfilesLabels,
      dataset: [{
        data: perfilesData,
        backgroundColor: ['#4dd0e1', '#00bfa5', '#283593', '#1565c0', '#283593'],
        label: 'Distribución de Estudiantes por Tipo'
      }]
    };
  }
  moverSemanaHorario(dir: number) {
    this.semanaActual = this.semanaActual.add(dir == -1 ? '-7' : '7', 'days');
    this.cargarHorario();
  }
  async mostrarRiesgosAlumnos() {
    await this.nav2.push(RiesgosAlumnosPage)
  }
  async mostrarAsesorPedagogico() {
    await this.nav2.push(AsesorPedagogicoPage)
  }
  async mostrarDistribucionNotas() {
    await this.nav2.push(DistribucionNotasPage)
  }
  async mostrarOportunidadesAlumnos() {
    await this.nav2.push(OportunidadesAlumnosPage)
  }
  async mostrarTiposAlumnos() {
    await this.nav2.push(TiposAlumnosPage)
  }
  async mostrarPefilAlumnos() {
    await this.nav2.push(PerfilAlumnosPage)
  }
  async mostrarAsignaturasPrereq() {
    await this.nav2.push(AsignaturasPrerequisitosPage)
  }
  async presentSuccess(mensaje: string) {
    const alert = await this.alertCtrl.create({
      backdropDismiss: false,
      keyboardClose: false,
      cssClass: 'success-alert',
      message: `<div class="image"><ion-icon src = "./assets/icon/fact_check.svg"></ion-icon></div>${mensaje}`,
      buttons: [
        {
          text: 'Aceptar',
          role: 'ok'
        }
      ]
    });

    await alert.present();
  }
  async presentFail(mensaje: string) {
    await this.dialog.showAlert({
      backdropDismiss: false,
      keyboardClose: false,
      cssClass: 'fail-alert',
      message: `<div class="image"><ion-icon src = "./assets/icon/app_blocking.svg"></ion-icon></div>${mensaje}`,
      buttons: [
        {
          text: 'Aceptar',
          role: 'ok'
        }
      ]
    });
  }
  async hapticsVibrate() {
    await Haptics.vibrate();
  }
  resolverFechaTermino() {
    // let fechaInicio = moment('25/04/2023 12:20', 'DD/MM/YYYY HH:mi');
    // return moment(this.estadoClase.terminoClase, 'DD/MM/YYYY HH:mi').from(fechaInicio);
    return this.estadoClase.terminoClase;
  }
  resolverCssNota(nota: string) {
    const value = parseFloat(nota);

    if (!isNaN(value)) {
      if (value >= 1 && value < 2) {
        return 'rojo'
      }
      else if (value >= 2 && value < 4) {
        return 'naranjo'
      }
      else if (value >= 4 && value < 6) {
        return 'amarillo'
      }
      else if (value >= 6 && value < 7) {
        return 'limon'
      }
      return 'verde'
    }

    return '';
  }
  resolverFoto(persNcorr: any) {
    return `${this.global.Api}/api/v4/avatar/${persNcorr}`;
  }
  groupBy(xs: any, key: any, sortKey: any) {
    return xs.reduce(function (rv: { key: any; values: any[]; }[], x: { [x: string]: any; }) {
      let v = key instanceof Function ? key(x) : x[key];
      let el = rv.find(r => r && r.key === v);

      if (el) {
        el.values.push(x);
        el.values.sort(function (a, b) {
          return a[sortKey].toLowerCase().localeCompare(b[sortKey].toLowerCase());
        });
      } else {
        rv.push({ key: v, values: [x] });
      }

      return rv;
    }, []);
  }
  get totalEstudiantes() {
    let total = 0;

    if (this.resumen) {
      this.resumen.oportunidades.forEach((item: any) => {
        total += item.value
      });
    }

    return total;
  }
  get motivoError() {
    if (this.asistenciaForm.touched) {
      if (this.asistenciaForm.get('motivo')?.hasError('required')) return 'Campo es obligatorio.';
    }
    return '';
  }
  get justificacionError() {
    if (this.asistenciaForm.get('justificacion')?.hasError('required')) return 'Campo es obligatorio.';
    if (this.asistenciaForm.get('justificacion')?.hasError('minlength')) return 'Mínimo 10 caracteres.';
    if (this.asistenciaForm.get('justificacion')?.hasError('maxlength')) return 'Máximo 2000 caracteres permitidos.';
    if (this.asistenciaForm.get('justificacion')?.hasError('pattern')) return 'Campo con caracteres no permitidos.';
    return '';
  }

}
