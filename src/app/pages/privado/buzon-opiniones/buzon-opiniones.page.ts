import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController, Platform } from '@ionic/angular';
import * as moment from 'moment';
import { BuzonopinionService } from 'src/app/core/services/buzonopinion.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DetalleOpinionPage } from './detalle-opinion/detalle-opinion.page';
import { MediaService } from 'src/app/core/services/media.service';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { DialogService } from 'src/app/core/services/dialog.service';

@Component({
  selector: 'app-buzon-opiniones',
  templateUrl: './buzon-opiniones.page.html',
  styleUrls: ['./buzon-opiniones.page.scss'],
})
export class BuzonOpinionesPage implements OnInit {

  @ViewChild('adjuntarInput') adjuntarEl!: ElementRef;
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
    private error: ErrorService,
    private pt: Platform,
    private dialog: DialogService,
    private snackbar: SnackbarService,
    private utils: UtilsService,
    private domSanitizer: DomSanitizer,
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
  async ngOnInit() {
    await this.cargar();
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
    const loading = await this.dialog.showLoading({ message: 'Cargando...' });

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
      const media = await this.media.getMedia();

      if (media) {
        const fileSize = media?.size! / 1024 / 1024;
        const base64String = media.data;

        if (fileSize >= 150) {
          this.presentError('Cargar Archivos', 'Los documentos no pueden exceder los 150 MB.');
          return;
        }

        try {
          await this.uploadBase64Fragmented(base64String, media.name);
        }
        catch (error: any) {
          if (error && error.status == 401) {
            this.error.handle(error);
            return
          }

          await this.presentError('Cargar Archivos', 'No se pudo procesar el archivo. Vuelve a intentarlo.');
        }
      }
    }
  }
  async adjuntarWeb(event: any) {
    if (event.target.files.length > 0) {
      let file = event.target.files[0];
      let fileSize = file.size / 1024 / 1024;

      if (fileSize >= 150) {
        await this.presentError('Cargar Archivos', 'Los documentos no pueden exceder los 150 MB.');
        return;
      }

      try {
        const base64 = await this.utils.fileToBase64(file);
        await this.uploadBase64Fragmented(base64, file.name);
      }
      catch (error: any) {
        if (error && error.status == 401) {
          this.error.handle(error);
          return;
        }

        await this.presentError('Cargar Archivos', 'No se pudo procesar el archivo. Vuelve a intentarlo.');
      }
      finally {
        this.adjuntarEl.nativeElement.value = '';
      }
    }
  }
  async uploadBase64Fragmented(base64String: string, fileName: string): Promise<void> {
    const fragments = this.utils.divideBase64(base64String);
    const totalParts = fragments.length;
    const loading = await this.dialog.showLoading({ message: 'Cargando archivo...' });
    const tuserCcod = this.tipoUsuario;

    try {
      for (let i = 0; i < fragments.length; i++) {
        const base64Fragment = fragments[i];
        const partNumber = i + 1;
        const params = {
          file: base64Fragment,
          fileName: encodeURIComponent(fileName),
          partNumber: partNumber,
          totalParts: totalParts
        };

        if (totalParts > 1 && partNumber == totalParts) {
          loading.message = '(100%) finalizando....';
        }

        const response = await this.api.cargarArchivoV2(tuserCcod, params);
        const result = response.data;

        if (result.success) {
          if (result.code == 202) {
            const progreso = Math.round(result.progress);
            loading.message = `(${progreso}%) procesando....`;
          }
          else if (result.code == 200) {
            const fileExtension = this.utils.getFileExtension(fileName);
            const fileType = this.utils.getMimeType(fileExtension || '');

            this.documento = {
              name: fileName,
              type: fileType,
              content: base64String
            };

            this.solicitudId = result.data.resoNcorr;
            this.snackbar.showToast('Archivo cargado correctamente.', 3000, 'success');
          }
        }
        else {
          throw Error(result);
        }

      }
    }
    catch (error) {
      return Promise.reject(error);
    }
    finally {
      await loading.dismiss();
    }
  }
  async enviar() {
    if (this.form.valid) {
      const params = Object.assign(this.form.value, { tuserCcod: this.tipoUsuario, resoNcorr: this.solicitudId });
      const loading = await this.dialog.showLoading({ message: 'Enviando...' });

      try {
        const response = await this.api.enviarOpinion(params);
        const { data } = response;

        if (data.success) {
          await this.cargar();
          await this.presentSuccess('Su opinión N° ' + data.resoNcorr + ' se ha ingresado con éxito.');
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
    await this.dialog.showModal({
      component: DetalleOpinionPage,
      componentProps: {
        tipoUsuario: this.tipoUsuario,
        resoNcorr: resoNcorr
      },
      // presentingElement: this.routerOutlet.nativeEl
    });
  }
  async presentSuccess(mensaje: string) {
    const alert = await this.dialog.showAlert({
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
    });

    return alert;
  }
  async presentError(title: string, message: string) {
    const alert = await this.dialog.showAlert({
      cssClass: 'alert-message',
      message: `<img src="./assets/images/warning.svg" /><br />${message}`,
      header: title,
      buttons: ['Aceptar']
    });

    return alert;
  }
  reiniciar() {
    this.clopCcod?.setValue(this.clasificaciones[0].clopCcod);
    this.ticoCcod?.setValue(this.topicos[0].ticoCcod, { emitEvent: false });
    this.coopCcod?.setValue(this.temas[0].coopCcod);
    this.mensaje?.setValue('');
    this.mensaje?.reset();
    this.documento = undefined;
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
