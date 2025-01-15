import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController, IonRouterOutlet, LoadingController, ModalController, Platform } from '@ionic/angular';
import * as moment from 'moment';
import { BuzonopinionService } from 'src/app/core/services/buzonopinion.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DetalleOpinionPage } from './detalle-opinion/detalle-opinion.page';
import { MediaService } from 'src/app/core/services/media.service';
import { VISTAS_DOCENTE } from 'src/app/app.contants';

@Component({
  selector: 'app-buzon-opiniones',
  templateUrl: './buzon-opiniones.page.html',
  styleUrls: ['./buzon-opiniones.page.scss'],
})
export class BuzonOpinionesPage implements OnInit {

  tabModel = 0;
  form: FormGroup;
  patternStr = '^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ!@#"\'\n\r\$%\^\&*\ \)\(+=.,_-]+$';

  opiniones: any;
  clasificaciones: any;
  temas: any;
  topicos: any;
  tipoUsuario = '2';
  solicitudId = 0;
  documento: any;
  mostrarCargando = true;
  mostrarData = false;

  constructor(private api: BuzonopinionService,
    private fb: FormBuilder,
    private loading: LoadingController,
    private error: ErrorService,
    private pt: Platform,
    private alertCtrl: AlertController,
    private snackbar: SnackbarService,
    private utils: UtilsService,
    private domSanitizer: DomSanitizer,
    private modalCtrl: ModalController,
    private routerOutlet: IonRouterOutlet,
    private media: MediaService) {

    moment.locale('es');

    this.form = this.fb.group({
      clopCcod: ['', Validators.required],
      ticoCcod: ['', Validators.required],
      coopCcod: ['', Validators.required],
      resoTsugerencia: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(2000),
        Validators.pattern(this.patternStr)
      ])]
    });

    this.ticoCcod?.valueChanges.subscribe((value) => {
      this.cargarSubcategorias(value);
    })

  }
  ngOnInit() {
    this.cargar();
    this.api.marcarVista(VISTAS_DOCENTE.BUZON_OPINIONES);
  }
  async cargar() {
    try {
      const params = {}
      const response = await this.api.getPrincipal(params);
      const { data } = response;

      if (data.success) {
        this.clasificaciones = data.data.clasificaciones;
        this.temas = data.data.temas;
        this.topicos = data.data.topicos;
        this.reiniciar();
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

      this.snackbar.showToast('No pudimos cargar la información. Vuelva a intentar.', 3000, 'danger');
    }
    finally {

    }
  }
  async cargarOpiniones() {
    if (this.tabModel == 1) {
      const params = {
        esreCcod: '0',
        tuserCcod: this.tipoUsuario,
        start: 0,
        limit: 10
      };

      try {
        const response = await this.api.getOpiniones(params)
        const { data } = response;

        if (data.success) {
          this.opiniones = data.opiniones;
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

        this.snackbar.showToast('No pudimos cargar la información. Vuelva a intentar.', 3000, 'danger');
      }
      finally {
        this.mostrarCargando = false;
        this.mostrarData = true;
      }
    }
  }
  async cargarSubcategorias(ticoCcod: any) {
    const loading = await this.loading.create({ message: 'Cargando...' });

    await loading.present();

    try {
      const params = { ticoCcod: ticoCcod };
      const response = await this.api.getSubcategorias(params);
      const { data } = response;

      if (data.success) {
        this.temas = data.temas;
        this.coopCcod?.patchValue(this.temas[0].coopCcod);
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

      this.snackbar.showToast('No pudimos procesar su solicitud. Vuelva a intentar.', 3000, 'danger');
    }
    finally {
      await loading.dismiss();
    }
  }
  async adjuntar(input: any) {
    if (this.pt.is('mobileweb')) {
      input.click();
    }
    else {
      const file = await this.media.getMedia();

      if (file) {
        const params = { tuserCcod: this.tipoUsuario };
        const fileSize = file?.size! / 1024 / 1024;
        const loading = await this.loading.create({ message: 'Cargando archivo...' });

        if (fileSize <= 3) {
          await loading.present();

          try {
            const respone: any = await this.api.cargarArchivo(file?.path!, file?.name!, params);
            const { data } = respone;

            if (data.success == false) {
              this.snackbar.showToast(data.message);
              return;
            }

            this.documento = {
              name: file.name,
              type: file.name.endsWith('.jpg') ? 'image/jpeg' : '',
              content: file.data
            };

            this.solicitudId = data.resoNcorr;
          }
          catch (error: any) {
            if (error && error.status == 401) {
              this.error.handle(error);
              return;
            }

            this.snackbar.showToast('No pudimos cargar el archivo.', 3000, 'danger');
          }
          finally {
            loading.dismiss();
          }
        }
        else {
          this.snackbar.showToast('Los archivos no pueden exceder los 3 MB.', 2000);
        }
      }
    }
  }
  async adjuntarWeb(event: any) {
    if (event.target.files.length > 0) {
      let formData = new FormData();
      let file = event.target.files[0];
      var fileSize = file.size / 1024 / 1024;
      let loading = await this.loading.create({ message: 'Cargando archivo...' });

      if (fileSize <= 3) {
        formData.append('file', file);

        await loading.present();

        try {
          const params = { tuserCcod: this.tipoUsuario };
          const response = await this.api.cargarArchivoWeb(formData, params);
          const { data } = response;

          if (data.success == false) {
            this.snackbar.showToast(data.message);
            return;
          }

          const base64 = await this.utils.convertBlobToBase64(file);

          this.documento = {
            name: file.name,
            type: file.type,
            content: base64
          };

          this.solicitudId = data.resoNcorr;
        }
        catch (error: any) {
          if (error && error.status == 401) {
            this.error.handle(error);
            return;
          }

          this.snackbar.showToast('No pudimos cargar el archivo.', 3000, 'danger');
        }
        finally {
          await loading.dismiss();
        }
      } else {
        this.snackbar.showToast('El archivo no pueden exceder los 3 MB.', 2000);
      }
    }
  }
  async enviar() {
    if (this.form.valid) {
      const params = Object.assign(this.form.value, { tuserCcod: this.tipoUsuario, resoNcorr: this.solicitudId });
      const loading = await this.loading.create({ message: 'Enviando...' });

      await loading.present();

      try {
        const response = await this.api.enviarOpinion(params);
        const { data } = response;

        if (data.success) {
          this.cargar();
          this.presentSuccess('Su opinión N° ' + data.resoNcorr + ' se ha ingresado con éxito.');
        }
        else {
          this.snackbar.showToast(data.message, 3000, 'danger');
        }
      }
      catch (error: any) {
        if (error && error.status == 401) {
          this.error.handle(error);
          return
        }

        this.snackbar.showToast('No pudimos procesar su solicitud. Vuelva a intentar.', 3000, 'danger');
      }
      finally {
        await loading.dismiss();
      }
    }
    else {
      this.form.markAllAsTouched();
    }
  }
  async detalleOpinion(resoNcorr: any) {
    const modal = await this.modalCtrl.create({
      component: DetalleOpinionPage,
      componentProps: {
        tipoUsuario: this.tipoUsuario,
        resoNcorr: resoNcorr
      },
      // presentingElement: this.routerOutlet.nativeEl
    });

    await modal.present();
  }
  presentSuccess(mensaje: string) {
    this.alertCtrl.create({
      backdropDismiss: false,
      keyboardClose: false,
      cssClass: 'success-alert',
      header: 'Buzón de Opiniones',
      message: `<div class="image"><ion-icon src = "./assets/icon/check_circle.svg"></ion-icon></div>${mensaje}`,
      buttons: [
        {
          text: 'Aceptar',
          role: 'ok'
        }
      ]
    }).then(alert => alert.present())
  }
  reiniciar() {
    this.clopCcod?.setValue(this.clasificaciones[0].clopCcod);
    this.ticoCcod?.setValue(this.topicos[0].ticoCcod, { emitEvent: false });
    this.coopCcod?.setValue(this.temas[0].coopCcod);
    this.mensaje?.setValue('');
    this.mensaje?.reset();
  }
  mostrarMiniatura(type: string) {
    return type.indexOf('image/') > -1;
  }
  resolverMiniatura(data: any) {
    return this.domSanitizer.bypassSecurityTrustUrl(data.content);
  }
  resolverFecha(fecha: string) {
    return moment(fecha, 'DD/MM/YYYY').format('D [de] MMMM, YYYY');
  }
  get clopCcod() { return this.form.get('clopCcod'); }
  get ticoCcod() { return this.form.get('ticoCcod'); }
  get coopCcod() { return this.form.get('coopCcod'); }
  get mensaje() { return this.form.get('resoTsugerencia'); }
  get mensajeError() {
    if (this.mensaje?.hasError('required')) return 'Campo es obligatorio.';
    if (this.mensaje?.hasError('maxlength')) return 'Máximo 2000 caracteres permitidos.';
    if (this.mensaje?.hasError('pattern')) return 'Sólo puede ingresar caracteres alfanuméricos.';
    return '';
  }

}
