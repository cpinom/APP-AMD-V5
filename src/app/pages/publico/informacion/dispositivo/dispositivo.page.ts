import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Haptics } from '@capacitor/haptics';
import { ActionSheetController, AlertController, IonInput, LoadingController, ModalController, Platform } from '@ionic/angular';
import { DispositivoService } from 'src/app/core/services/dispositivo.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { Swiper } from 'swiper/types';
import { AppGlobal } from '../../../../app.global';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';

@Component({
  selector: 'app-dispositivo',
  templateUrl: './dispositivo.page.html',
  styleUrls: ['./dispositivo.page.scss'],
})
export class DispositivoPage implements AfterViewInit, OnDestroy {

  @ViewChild('swiper') private swiperRef: ElementRef | undefined;
  @ViewChild('pinEl', { static: true }) pinEl!: IonInput;
  @ViewChild('codigoEl', { static: true }) codigoEl!: IonInput;
  @ViewChild('serieEl', { static: true }) serieEl!: IonInput;
  swiper!: Swiper;
  data: any;
  modoConfig!: number;
  pinForm!: FormGroup;
  tabletForm!: FormGroup;
  aptaNcorrReemplazo: any;
  mostrarCargando = false;

  constructor(private api: DispositivoService,
    private fb: FormBuilder,
    private snackbar: SnackbarService,
    private modal: ModalController,
    private loading: LoadingController,
    private action: ActionSheetController,
    private global: AppGlobal,
    private pt: Platform,
    private alertCtrl: AlertController) {

    this.pinForm = this.fb.group({
      pin: [, Validators.compose([
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6)
      ])]
    });

    this.tabletForm = this.fb.group({
      aptaTuuid: [],
      aptaNcorr: [],
      sedeTdesc: [],
      aptaCtablets: [, Validators.compose([
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10)
      ])],
      aptaNserie: [, Validators.compose([
        Validators.required,
        Validators.maxLength(40)
      ])]
    });

  }
  async ngAfterViewInit() {
    debugger
    this.swiper = this.swiperRef?.nativeElement.swiper;

    const isValid = await this.api.dataValid();

    if (isValid) {
      this.data = await this.api.getData();
      this.mostrarOpciones(0);
    }
    else {
      setTimeout(() => {
        this.pinEl.setFocus();
        this.swiper.disable();
      }, 500);
    }
  }
  ngOnDestroy() {
  }
  onPinInput(ev: any) {
    const value = ev.target!.value;
    const filteredValue = value.replace(/[^0-9]+/g, '');

    this.pinEl.value = filteredValue;
    this.pinForm.get('pin')?.setValue(filteredValue, { emitEvent: false });
  }
  async validarPin() {
    if (this.pinForm.valid) {
      let params = {
        pin: this.pinForm.get('pin')?.value,
        aptaTuuid: this.global.DeviceId
      };

      this.mostrarCargando = true;

      try {
        const response = await this.api.acceso(params);
        const { data } = response;

        if (data.success) {
          await this.api.setDeviceId(data.data.tablet.aptaNcorr);
          await this.api.setAuth(data.data, 3);
          this.data = data.data;
          this.mostrarOpciones();
        }
        else {
          this.snackbar.showToast(data.message);
          this.pinForm.get('pin')?.setValue('');
        }
      }
      catch (error) {
        console.log('error: ', error);
        this.snackbar.showToast('El servicio no se encuentra disponible o presenta algunos problemas de cobertura, reintenta en un momento.');
      }
      finally {
        this.mostrarCargando = false;
      }
    }
  }
  async mostrarOpciones(speed?: number) {
    this.swiper.enable();
    this.swiper.slideTo(1, speed);
    this.swiper.disable();

    try {
      let GeolocationPermission = await Geolocation.checkPermissions();
      let CameraPermission = await Camera.checkPermissions();

      if (GeolocationPermission.location == 'denied' || GeolocationPermission.location == 'prompt') {
        if (this.pt.is('capacitor')) {
          GeolocationPermission = await Geolocation.requestPermissions();
        }
      }

      if (GeolocationPermission.location != 'granted') {
        await this.presentWarning('Se deben habilitar los permisos de "Ubicación"');
      }

      if (CameraPermission.camera == 'denied' || CameraPermission.camera == 'prompt') {
        if (this.pt.is('capacitor')) {
          CameraPermission = await Camera.requestPermissions();
        }
      }

      if (CameraPermission.camera != 'granted') {
        await this.presentWarning('Se deben habilitar los permisos de "Cámara"');
      }
    }
    catch { }
  }
  async presentWarning(message: string) {
    return new Promise(resolve => {
      this.alertCtrl.create({
        header: 'ADVERTENCIA',
        message: message,
        backdropDismiss: false,
        keyboardClose: false,
        buttons: [{
          text: 'Continuar',
          role: 'destrucitve',
          handler: () => {
            resolve(true)
          }
        }]
      }).then(alert => alert.present());
    })
  }
  async modoConfigTap() {
    this.swiper.enable();
    if (this.modoConfig == 0) {
      this.tabletForm.get('aptaTuuid')?.setValue(this.data.tablet.aptaTuuid);
      this.tabletForm.get('aptaNcorr')?.setValue(this.data.tablet.aptaNcorr);
      this.tabletForm.get('sedeTdesc')?.setValue(this.data.sedeTdesc);
      this.aptaCtablets?.setValue(this.data.tablet.aptaCtablets);
      this.aptaNserie?.setValue(this.data.tablet.aptaNserie);
      this.swiper.slideTo(2, 0)
    }
    else if (this.modoConfig == 1) {
      this.tabletForm.get('aptaTuuid')?.setValue(this.data.tablet.aptaTuuid);
      this.tabletForm.get('aptaNcorr')?.setValue(this.data.tablet.aptaNcorr);
      this.tabletForm.get('sedeTdesc')?.setValue(this.data.sedeTdesc);
      this.swiper.slideTo(2, 0)
    }
    else if (this.modoConfig == 2) {
      this.swiper.slideTo(3, 0)
    }
    this.swiper.disable()
  }
  async guardarTablet() {
    if (this.tabletForm.valid) {
      let loading = await this.loading.create({ message: 'Procesando...' });

      loading.present();
      this.mostrarCargando = true;

      try {
        const params = Object.assign({ amseTpin: this.data.amseTpin, sedeCcod: this.data.sedeCcod }, this.tabletForm.value);
        const response = await this.api.actualizarTablet(params);
        const { data } = response;

        if (data.success) {
          if (data.code == 1) {
            this.snackbar.showToast('Tablet guardada correctamente.', 3000, 'success');
            this.modal.dismiss();
            this.api.clearData();
          }
          else if (data.code == 2) {
            this.snackbar.showToast(`Ya existe un Código Tablet "${this.aptaCtablets?.value}". Intente con otro.`, 3000, 'danger');
            this.aptaCtablets?.setValue('');
            Haptics.vibrate();
          }
          else if (data.code == 3) {
            this.snackbar.showToast('Tablet migrada correctamente.', 3000, 'success');
            this.modal.dismiss();
            this.api.clearData();
          }
          else if (data.code == 4) {
            this.snackbar.showToast('El nuevo ID APP ingresado no corresponde a un código valido.', 3000, 'danger');
            Haptics.vibrate();
          }
        } else {
          this.snackbar.showToast(data.message);
          Haptics.vibrate();
        }
      }
      catch (error: any) {
        this.snackbar.showToast('Ha ocurrido un error inesperado. Vuelva a intentar.', 3000, 'danger');
      }
      finally {
        loading.dismiss();
        this.mostrarCargando = false;
      }

    } else {
      this.tabletForm.markAllAsTouched();
    }
  }
  resolverEstado(estaCcod: number) {
    if (estaCcod == 1) return 'HABILITADA';
    if (estaCcod == 3) return 'ASIGNADA';
    if (estaCcod == 2 || estaCcod == 5) return 'DESHABILITADA';
    return '';
  }
  onCodigoInput(ev: any) {
    const value = ev.target!.value;
    const filteredValue = value.replace(/[^a-zA-Z0-9_-]+/g, '').toUpperCase();

    this.codigoEl.value = filteredValue;
    this.aptaCtablets?.setValue(filteredValue, { emitEvent: false });
  }
  onSerieInput(ev: any) {
    const value = ev.target!.value;
    const filteredValue = value.replace(/[^a-zA-Z0-9]+/g, '').toUpperCase();

    this.serieEl.value = filteredValue;
    this.aptaNserie?.setValue(filteredValue, { emitEvent: false });
  }
  async reemplazar(tablet: any) {
    const actionSheet = await this.action.create({
      header: '¿Segur@ que quieres reemplazar la tablet?',
      buttons: [
        {
          text: 'Sí, Continuar',
          role: 'destructive',
          handler: this.procesarReemplazar.bind(this, tablet)
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }
  async procesarReemplazar(tablet: any) {
    debugger
    const loading = await this.loading.create({ message: 'Procesando...' });
    const params = {
      amseTpin: this.data.amseTpin,
      sedeCcod: this.data.sedeCcod,
      aptaTuuid: tablet.aptaTuui,
      aptaNcorr: this.data.tablet.aptaNcorr,
      aptaCtablets: tablet.aptaCtablets,
      aptaNserie: tablet.aptaNserie
    };

    loading.present();
    this.mostrarCargando = true;

    try {
      const response = await this.api.actualizarTablet(params);
      const { data } = response;

      if (data.success) {
        if (data.code == 3) {
          this.snackbar.showToast('Tablet migrada correctamente.', 3000, 'success');
          this.modal.dismiss();
          this.api.clearData();
        } else if (data.code == 4) {
          this.snackbar.showToast('El nuevo ID APP ingresado no corresponde a un código valido.', 3000, 'danger');
        }
      }
    }
    catch (error) {
      console.log('<<<error actualizarTablet>>>', error);
      this.snackbar.showToast('Ha ocurrido un error inesperado. Vuelva a intentar.', 3000, 'danger');
    }
    finally {
      loading.dismiss();
      this.mostrarCargando = false;
    }
  }
  salir() {
    this.modal.dismiss();
    this.api.clearData();
  }
  get tabletsReemplazo() {
    if (this.data) {
      return this.data.tablets.filter((t: any) => t.aptaNcorr != this.data.tablet.aptaNcorr);
    }
    return [];
  }
  get codigoError() {
    if (this.aptaCtablets?.hasError('required')) return 'Campo es obligatorio.';
    if (this.aptaCtablets?.hasError('minlength')) return 'Mínimo de 10 caracteres.';
    if (this.aptaCtablets?.hasError('maxlength')) return 'Máximo de 10 caracteres permitidos.';
    if (this.aptaCtablets?.hasError('espaciosBlancos')) return 'El campo no puede contener espacios en blanco.';
    return '';
  }
  get serieError() {
    if (this.aptaNserie?.hasError('required')) return 'Campo es obligatorio.';
    if (this.aptaNserie?.hasError('maxlength')) return 'Máximo de 40 caracteres permitidos.';
    return '';
  }
  get aptaCtablets() { return this.tabletForm.get('aptaCtablets'); }
  get aptaNserie() { return this.tabletForm.get('aptaNserie'); }

}
