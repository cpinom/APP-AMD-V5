import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ComunicacionesService } from 'src/app/core/services/comunicaciones.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UtilsService } from 'src/app/core/services/utils.service';
import { MediaService } from 'src/app/core/services/media.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { DomSanitizer } from '@angular/platform-browser';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { DialogService } from 'src/app/core/services/dialog.service';

@Component({
  selector: 'app-comunicaciones',
  templateUrl: './comunicaciones.page.html',
  styleUrls: ['./comunicaciones.page.scss'],
})
export class ComunicacionesPage implements OnInit, OnDestroy {

  @ViewChild('adjuntarInput') adjuntarEl!: ElementRef;
  mostrarCargando = true;
  mostrarData = false;
  cursos: any;
  messageId!: string;
  correo: string | undefined;
  form: FormGroup;
  patternStr = '^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ¡!@#¿?,:;\n\r\$%\^\&*\ \)\(+=._-]+$';
  documentos: any[] = [];
  submitted = false;
  marcaTodos = false;

  constructor(private pt: Platform,
    private api: ComunicacionesService,
    private auth: AuthService,
    private error: ErrorService,
    private fb: FormBuilder,
    private utils: UtilsService,
    private dialog: DialogService,
    private media: MediaService,
    private snackbar: SnackbarService,
    private domSanitizer: DomSanitizer) {

    this.form = this.fb.group({
      asunto: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(this.patternStr)
      ])],
      mensaje: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(1000),
        Validators.pattern(this.patternStr)
      ])],
      secciones: new FormArray([], Validators.required),
      marcaCC: [true],
      marcaDC: [false]
    });

    this.auth.getAuth().then(auth => {
      this.correo = auth.user.persTemailInacap
    })

  }
  ngOnInit() {
    this.cargar();
    this.api.marcarVista(VISTAS_DOCENTE.MENSAJES_SECCIONES);
  }
  ngOnDestroy() {
    if (this.messageId) {
      this.api.eliminarBorrador({ messageId: this.messageId });
    }
  }
  async cargar(forceRefresh = false) {
    try {
      const response = await this.api.getPrincipal(forceRefresh);
      const { data } = response;

      if (data.success) {
        this.messageId = data.messageId;
        this.cursos = data.cursos;
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
    }
    finally {
      this.mostrarCargando = false;
      this.mostrarData = true;
    }
  }
  recargar() {
    this.mostrarCargando = true;
    this.mostrarData = false;
    this.cargar(true);
    this.form.get('asunto')?.reset('');
    this.form.get('mensaje')?.reset('');
    this.form.get('marcaCC')?.setValue(true);
    this.form.get('marcaDC')?.setValue(false);
    this.documentos = [];
  }
  async enviar(ev?: any) {
    this.submitted = true;

    const isValid = this.form.valid;

    if (isValid) {
      const loading = await this.dialog.showLoading({ message: 'Enviando comunicación...' });

      try {
        const params = Object.assign({ id: this.messageId }, this.form.value);
        const response = await this.api.enviarMensaje(params);
        const { data } = response;

        if (data.success) {
          await this.presentSuccess('Comunicación enviada correctamente.');
          this.submitted = false;
          this.recargar();
          this.api.marcarVista(VISTAS_DOCENTE.ENVIA_MENSAJE_SECCIONES);
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
    else {
      this.form.markAllAsTouched();
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

        if (fileSize >= 25) {
          this.presentError('Cargar Archivos', 'Los documentos no pueden exceder los 25 MB.');
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

        /*if (fileSize <= 150) {
          const loading = await this.dialog.showLoading({ message: 'Cargando archivo...' });

          try {
            const respone: any = await this.api.agregarArchivo(file?.path!, file?.name!, params);
            const { data } = respone;
            console.log('<<<file>>>', file);
            if (data.success) {
              this.documentos.push({
                id: data.id,
                name: file!.name,
                type: data.type,
                size: data.size,
                content: file?.data
              });
            }
            else {
              throw Error();
            }
          }
          catch (error: any) {
            console.log('<<file upload error>>');
            console.log(error);
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
        }*/
      }
    }
  }
  async adjuntarWeb(event: any) {
    if (event.target.files.length > 0) {
      let file = event.target.files[0];
      let fileSize = file.size / 1024 / 1024;

      if (fileSize >= 25) {
        await this.presentError('Cargar Archivos', 'Los documentos no pueden exceder los 25 MB.');
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

        const response = await this.api.agregarArchivoV5(this.messageId, params);
        const result = response.data;

        if (result.success) {
          if (result.code == 202) {
            const progreso = Math.round(result.progress);
            loading.message = `(${progreso}%) procesando....`;
          }
          else if (result.code == 200) {
            this.documentos.push({
              id: result.data.id,
              name: fileName,
              type: result.data.type,
              size: result.data.size,
              content: base64String
            });

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
  async verDocumento(doc: any) {
    await this.utils.openFile(doc.name, doc.type, doc.content);
  }
  async eliminarDocumento(doc: any, ev: any) {
    ev.stopPropagation();

    const snackbar = await this.snackbar.create('Eliminando adjunto...', false);
    const params = { messageId: this.messageId, attachmentId: doc.id };
    snackbar.present();

    try {
      const response = await this.api.eliminarArchivo(params);
      const { data } = response;

      if (data.success) {
        this.documentos.forEach((item, index) => {
          if (item === doc) this.documentos.splice(index, 1);
        });
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
      this.snackbar.showToast('Ha ocurrido un error mientras se procesaba su solicitud.', 3000, 'danger')
    }
    finally {
      snackbar.dismiss();
    }
  }
  mostrarMiniatura(type: string) {
    return type.indexOf('image/') > -1;
  }
  resolverMiniatura(data: any) {
    return this.domSanitizer.bypassSecurityTrustUrl(data.content);
  }
  resolverMarca(item: any, e: any) {
    e.preventDefault();

    item.selected = !item.selected;

    let count = this.cursos.filter((item: any) => item.selected);

    this.marcaTodos = this.cursos.length == count.length;

    this.actualizarCorreos();
  }
  marcarTodos(e: any) {
    this.cursos.forEach((item: any) => {
      item.selected = this.marcaTodos;
    });
    this.actualizarCorreos();
  }
  actualizarCorreos() {
    let formArray: FormArray = this.form.get('secciones') as FormArray;

    formArray.clear();

    this.cursos.forEach((item: any) => {
      if (item.selected) {
        formArray.push(new FormControl({
          seccCcod: item.seccCcod,
          ssecNcorr: item.ssecNcorr,
          sedeCcod: item.sedeCcod
        }));
      }
    })
  }
  async presentSuccess(mensaje: string) {
    await this.dialog.showAlert({
      backdropDismiss: false,
      keyboardClose: false,
      cssClass: 'success-alert',
      header: 'Comunicaciones',
      message: `<div class="image"><ion-icon src = "./assets/icon/check_circle.svg"></ion-icon></div>${mensaje}`,
      buttons: [
        {
          text: 'Aceptar',
          role: 'ok'
        }
      ]
    })
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
  get asuntoError() {
    if (this.asunto?.hasError('required')) return 'Campo es obligatorio.';
    if (this.asunto?.hasError('maxlength')) return 'Máximo 50 caracteres permitidos.';
    if (this.asunto?.hasError('pattern')) return 'Sólo puede ingresar caracteres alfanuméricos.';
    return '';
  }
  get mensajeError() {
    if (this.mensaje?.hasError('required')) return 'Campo es obligatorio.';
    if (this.mensaje?.hasError('maxlength')) return 'Máximo 1000 caracteres permitidos.';
    if (this.mensaje?.hasError('pattern')) return 'Sólo puede ingresar caracteres alfanuméricos.';
    return '';
  }
  get asunto() { return this.form.get('asunto') }
  get mensaje() { return this.form.get('mensaje') }

}
