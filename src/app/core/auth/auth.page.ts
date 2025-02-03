import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonInput, ModalController, Platform, ToastController } from '@ionic/angular';
import { CodeInputComponent } from 'angular-code-input';
import { SnackbarService } from '../services/snackbar.service';
import { AuthService } from './auth.service';
import { Haptics } from '@capacitor/haptics';
import { Swiper } from 'swiper/types';
import { UtilsService } from '../services/utils.service';
import { PerfilService } from '../services/perfil.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit, AfterViewInit {

  @ViewChild('swiperEl') private swiperRef: ElementRef | undefined;
  @ViewChild('user') userInput!: IonInput;
  @ViewChild('password') passwordInput: any;
  @ViewChild('codeInput') codeInput !: CodeInputComponent;

  swiper!: Swiper;
  cuentaForm: FormGroup;
  loginForm: FormGroup;
  procesando = false;
  poseePIN: boolean | undefined;
  nombreUsuario: string | undefined;
  errorMsg: string | undefined;
  mostrarVolver = false;

  constructor(private modalCtrl: ModalController,
    private fb: FormBuilder,
    private auth: AuthService,
    private snackbar: SnackbarService,
    private toast: ToastController,
    private utils: UtilsService,
    private perfil: PerfilService,
    private pt: Platform) {

    this.cuentaForm = this.fb.group({
      usuario: ['', Validators.required]
    });

    this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      clave: ['', Validators.required],
      pin: [false]
    });

    this.cuentaForm.get('usuario')?.valueChanges.subscribe((value: string) => {
      if (this.errorMsg) {
        this.errorMsg = '';
      }
    });

    this.loginForm.get('clave')?.valueChanges.subscribe((value: string) => {
      if (this.errorMsg) {
        this.errorMsg = '';
      }
    });

    if (this.pt.is('mobileweb')) {
      this.cuentaForm.get('usuario')?.setValue('166459362');
      this.loginForm.get('usuario')?.setValue('166459362');
      this.loginForm.get('usuario')?.setValue('Anto?E200');
    }

  }
  ngAfterViewInit() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
    this.swiper.disable();

    setTimeout(() => {
      this.userInput.setFocus();
    }, 500);
  }
  ngOnInit() { }
  async buscarCuenta() {
    if (this.cuentaForm.valid) {
      this.procesando = true;

      try {
        const response = await this.auth.buscarCuenta(this.cuentaForm.value);
        const { data } = response;

        if (data.success) {
          this.swiper.enable();
          this.swiper.slideNext();
          this.swiper.disable();

          this.nombreUsuario = data.usuario.nombre;
          this.poseePIN = data.usuario.pin;
          this.loginForm.get('usuario')?.setValue(data.usuario.id);
          this.loginForm.get('pin')?.setValue(data.usuario.pin);
          this.errorMsg = '';
          this.mostrarVolver = true;

          setTimeout(() => {
            if (this.poseePIN) {
              this.codeInput.focusOnField(0);
            } else {
              this.passwordInput.setFocus();
            }
          }, 750);
        } else {
          this.errorMsg = data.message;
          this.hapticsVibrate();
        }
      }
      catch (error) {
        console.log('error: ', error);
        this.snackbar.showToast('El servicio no se encuentra disponible o presenta algunos problemas de cobertura, reintenta en un momento.');
        this.hapticsVibrate();
      }
      finally {
        this.procesando = false;
      }
    }
  }
  async login() {
    if (this.loginForm.valid) {
      this.errorMsg = '';
      this.procesando = true;

      try {
        const response = await this.auth.login(this.loginForm.value);
        const { data } = response;

        if (data.success) {
          await this.modalCtrl.dismiss(data.data);
        } else if (data.passwordExpired === true) {
          await this.mostrarRecuperar(data.message, data.urlUpdatePassword);
        } else {
          if (data.code == 401 && this.codeInput) {
            this.codeInput.reset();
            this.codeInput.focusOnField(0);
          }

          this.errorMsg = data.message;
          this.hapticsVibrate();
        }
      }
      catch (error) {
        this.snackbar.showToast('El servicio no se encuentra disponible o presenta algunos problemas de cobertura, reintenta en un momento.');
        this.hapticsVibrate();
      }
      finally {
        this.procesando = false;
      }
    }
  }
  async cerrar() {
    await this.modalCtrl.dismiss(false);
  }
  onPinChanged(code: string) {
    this.loginForm.get('clave')?.setValue(code);
  }
  onPinCompleted(code?: string) { }
  mostrarClave() {
    this.poseePIN = false;
    this.loginForm.get('clave')?.setValue('');
    this.loginForm.get('pin')?.setValue(false);
    setTimeout(() => {
      this.passwordInput.setFocus();
    }, 500);
  }
  async mostrarBuscador() {
    this.errorMsg = '';
    this.swiper.enable();
    this.swiper.slidePrev();
    this.swiper.disable();
    this.mostrarVolver = false;
  }
  async mostrarRecuperar(message: string, url: string) {
    this.toast.getTop().then(currentToast => {
      currentToast && currentToast.dismiss();
    });

    const toast = await this.toast.create({
      message: message,
      color: 'dark',
      buttons: [{
        text: 'Actualizar ahora',
        handler() {
          window.open(url);
        }
      }],
      duration: 5000
    });

    await toast.present();
  }
  async hapticsVibrate() {
    await Haptics.vibrate();
  }
  async abrirNavegador(url: string) {
    await this.utils.openLink('https://www.inacap.cl/tportalvp/recuperar_clave/')
  }
  resolverLogo() {
    if (this.perfil.isDarkMode()) {
      return 'assets/images/inacap-logo-blanco.png';
    }
    return 'assets/images/inacap-logo.png';
  }

}
