import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileOpener } from '@capacitor-community/file-opener';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { AppGlobal } from 'src/app/app.global';
import { CursoService } from 'src/app/core/services/curso/curso.service';
import { DialogService } from 'src/app/core/services/dialog.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { MediaService } from 'src/app/core/services/media.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-soporte-tecnico',
  templateUrl: './soporte-tecnico.page.html',
  styleUrls: ['./soporte-tecnico.page.scss'],
})
export class SoporteTecnicoPage implements OnInit {

  @ViewChild('adjuntarInput') adjuntarEl!: ElementRef;
  libro: any;
  id: any;
  tipos: any;
  documentos: any[] | undefined;
  formTicket!: FormGroup;
  patternStr = '^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ!@#\n\r\$%\^\&*\ \)\(+=,._-¿?"]+$';

  constructor(private pt: Platform,
    private media: MediaService,
    private dialog: DialogService,
    private api: CursoService,
    private snackbar: SnackbarService,
    private error: ErrorService,
    private fb: FormBuilder,
    private utils: UtilsService,
    private global: AppGlobal) {

    this.formTicket = this.fb.group({
      tipo: ['', Validators.required],
      comentario: ['', Validators.compose([
        Validators.maxLength(2000),
        Validators.pattern(this.patternStr)
      ])]
    });

    this.tipo?.valueChanges.subscribe((apttCcod: number) => {
      if (apttCcod == 7) {
        this.comentario?.clearValidators()
        this.comentario?.setValidators([
          Validators.required,
          Validators.maxLength(2000),
          Validators.pattern(this.patternStr)
        ]);
      }
      else {
        this.comentario?.clearValidators()
        this.comentario?.setValidators([
          Validators.maxLength(2000),
          Validators.pattern(this.patternStr)
        ]);
      }

      this.comentario?.updateValueAndValidity();
    })

  }
  ngOnInit() {
    this.api.marcarVista(VISTAS_DOCENTE.CURSO_SOPORTE_TI);
  }
  async adjuntar(input: any) {
    if (!this.pt.is('capacitor')) {
      input.click();
    }
    else {
      const media = await this.media.getMedia();

      if (media) {
        const fileSize = media.size / 1024 / 1024;
        const base64String = media.data;

        if (fileSize >= 150) {
          await this.presentError('Cargar Archivos', 'Los documentos no pueden exceder los 150 MB.');
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

      /*const file = await this.media.getMedia(true);

      if (file) {
        const params = { aptiNcorr: this.id };
        const fileSize = file?.size! / 1024 / 1024;
        const loading = await this.loading.create({ message: 'Cargando archivo...' });

        if (fileSize <= 3) {
          await loading.present();

          try {
            const respone: any = {};//await this.api.cargarArchivoTicket(file?.path!, file?.name!, params);
            const { data } = respone;

            if (data.success) {
              this.documentos = data.documentos;
              this.snackbar.showToast('Archivo cargado correctamente.', 3000, 'success');
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
        }
      }*/
    }
  }
  async adjuntarWeb(event: any) {
    const file = event.target.files[0];
    const fileSize = file.size / 1024 / 1024;

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
    /*if (event.target.files.length > 0) {
      let formData = new FormData();
      let file = event.target.files[0];
      let fileSize = file.size / 1024 / 1024;
      let params = { aptiNcorr: this.id };
      let loading = await this.loading.create({ message: 'Cargando archivo...' });

      if (fileSize <= 3) {
        formData.append('file', file);

        await loading.present();

        try {
          const response: any = {}; //= await this.api.cargarArchivoTicketWeb(formData, params);
          const { data } = response;

          if (data.success) {
            this.documentos = data.documentos;
            this.snackbar.showToast('Archivo cargado correctamente', 3000, 'success');
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


      } else {
        this.snackbar.showToast('El archivo no puede exceder los 3 MB.', 3000)
      }
    }*/
  }
  async uploadBase64Fragmented(base64String: string, fileName: string): Promise<void> {
    const fragments = this.utils.divideBase64(base64String);
    const totalParts = fragments.length;
    const loading = await this.dialog.showLoading({ message: 'Cargando archivo...' });
    const aptiNcorr = this.id;

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

        const response = await this.api.cargarArchivoTicketV5(aptiNcorr, params);
        const result = response.data;

        if (result.success) {
          if (result.code == 202) {
            const progreso = Math.round(result.progress);
            loading.message = `(${progreso}%) procesando....`;
          }
          else if (result.code == 200) {
            this.documentos = result.data.documentos;
            await loading.dismiss();
            await this.snackbar.showToast('Archivo cargado correctamente.', 3000, 'success');
            break;
          }
        }
        else {
          if (result.message) {
            await loading.dismiss();
            await this.presentError('Cargar Archivos', result.message);
          }
          else {
            throw Error(result);
          }
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
  async descargarDocumento(record: any, ev: any) {
    const loading = await this.dialog.showLoading({ message: 'Descargando...' });

    try {
      const params = { aptaNcorr: record.aptaNcorr };
      const response = await this.api.descargarArchivoTicket(params);
      const { data } = response;

      if (data.success) {
        if (this.pt.is('mobileweb')) {
          const linkSource = `data:${data.data.aptaTdesc};base64,${data.data.aptaBarchivo}`;
          const downloadLink = document.createElement('a');
          downloadLink.href = linkSource;
          downloadLink.download = data.data.aptaTnombre;
          downloadLink.click();
        }
        else {
          const file = await Filesystem.writeFile({
            path: data.data.aptaTnombre,
            data: data.data.aptaBarchivo,
            directory: Directory.Cache
          });

          await FileOpener.open({
            filePath: file.uri,
            contentType: data.data.aptaTdesc
          });
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

      await this.snackbar.showToast('No pudimos cargar el archivo.', 3000, 'danger');
    }
    finally {
      await loading.dismiss();
    }
  }
  async eliminarDocumento(record: any, ev: any) {
    ev.stopPropagation();

    const loading = await this.dialog.showLoading({ message: 'Eliminando...' });

    try {
      const params = {
        aptiNcorr: this.id,
        aptaNcorr: record.aptaNcorr
      };
      const response = await this.api.eliminarArchivoTicket(params);
      const { data } = response;

      if (data.success) {
        this.documentos = data.documentos;
        await this.snackbar.showToast('Archivo eliminado.', 3000, 'success');
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

      await this.snackbar.showToast('No pudimos eliminar el archivo.', 3000, 'danger');
    }
    finally {
      await loading.dismiss();
    }
  }
  async enviar() {
    if (this.formTicket.valid) {
      const confirm = await this.showConfirmation('¿Está seguro de enviar la solicitud?');

      if (!confirm) {
        return;
      }

      const loading = await this.dialog.showLoading({ message: 'Procesando...' });

      try {
        const params = {
          lclaNcorr: this.libro,
          aptiNcorr: this.id,
          apttCcod: this.tipo?.value,
          aptmTcomentario: this.comentario?.value,
          aptaNcorr: 0,
          lcmoNlatitud: null,
          lcmoNlongitud: null
        };
        const response = await this.api.enviarTicket(params);
        const { data } = response;

        await loading.dismiss();

        if (data.success) {
          await this.presentSuccess('Su solicitud ha sido enviada correctamente al equipo de soporte de su Sede.');
          await this.cerrar(data.estado);
          this.api.marcarVista(VISTAS_DOCENTE.CURSO_SOPORTE_TI_SOLICITUD);
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

        await this.snackbar.showToast('No pudimos procesar su solicitud. Vuelva a intentar.', 3000, 'danger');
      }
      finally {
        await loading.dismiss();
      }
    }
    else {
      this.formTicket.markAllAsTouched();
    }
  }
  async presentSuccess(mensaje: string) {
    const alert = await this.dialog.showAlert({
      backdropDismiss: false,
      keyboardClose: false,
      cssClass: 'success-alert',
      header: 'Apoyo Soporte TI',
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
  async showConfirmation(message: string, header: string = 'Solicitud Apoyo Soporte TI'): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.dialog.showAlert({
        header: header,
        message: message,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: 'Aceptar',
            role: 'destructive',
            handler: () => resolve(true)
          }
        ]
      });
    });
  }
  async cerrar(data?: any) {
    await this.dialog.dismissModal(data);
  }
  resolverIcono(path: string) {
    return this.utils.resolveIcon(path);
  }
  resolverImagen(aptaNcorr: string) {
    return `${this.global.Api}/api/curso/v5/thumbnail-ticket?aptaNcorr=${aptaNcorr}`;
  }
  esImagen(path: string) {
    return this.utils.isImage(path);
  }
  get tipo() { return this.formTicket.get('tipo'); }
  get comentario() { return this.formTicket.get('comentario'); }
  get tipoError() {
    if (this.formTicket.touched) {
      if (this.tipo?.hasError('required')) return 'Campo es obligatorio.';
    }
    return '';
  }
  get comentarioError() {
    if (this.comentario?.hasError('required')) return 'Campo es obligatorio.';
    if (this.comentario?.hasError('maxlength')) return 'Máximo 2000 caracteres permitidos.';
    if (this.comentario?.hasError('pattern')) return 'Campo con caracteres no permitidos.';
    return '';
  }

}
