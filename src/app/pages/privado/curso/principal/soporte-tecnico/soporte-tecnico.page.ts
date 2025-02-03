import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileOpener } from '@capacitor-community/file-opener';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Geolocation } from '@capacitor/geolocation';
import { AlertController, LoadingController, ModalController, Platform } from '@ionic/angular';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { CursoService } from 'src/app/core/services/curso/curso.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { MediaService } from 'src/app/core/services/media.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

@Component({
  selector: 'app-soporte-tecnico',
  templateUrl: './soporte-tecnico.page.html',
  styleUrls: ['./soporte-tecnico.page.scss'],
})
export class SoporteTecnicoPage implements OnInit {

  libro: any;
  id: any;
  tipos: any;
  documentos: any[] | undefined;
  formTicket!: FormGroup;
  patternStr = '^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ!@#\n\r\$%\^\&*\ \)\(+=,._-¿?"]+$';
  // coordinadas: any;

  constructor(private modalCtrl: ModalController,
    private pt: Platform,
    private media: MediaService,
    private loading: LoadingController,
    private api: CursoService,
    private snackbar: SnackbarService,
    private error: ErrorService,
    private fb: FormBuilder,
    private alertCtrl: AlertController) {

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
  async ngOnInit() {
    // let permission = await Geolocation.checkPermissions();
    // let coordinates: any;

    // if (permission.location == 'denied' || permission.location == 'prompt') {
    //   if (this.pt.is('capacitor')) {
    //     permission = await Geolocation.requestPermissions();
    //   }
    // }

    // try {
    //   coordinates = await Geolocation.getCurrentPosition();
    // }
    // catch { }

    // this.coordinadas = coordinates;
    this.api.marcarVista(VISTAS_DOCENTE.CURSO_SOPORTE_TI);
  }
  async adjuntar(input: any) {
    if (!this.pt.is('capacitor')) {
      input.click();
    }
    else {
      const file = await this.media.getMedia(true);

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
      }
    }
  }
  async adjuntarWeb(event: any) {
    if (event.target.files.length > 0) {
      let formData = new FormData();
      let file = event.target.files[0];
      let fileSize = file.size / 1024 / 1024;
      let params = { aptiNcorr: this.id };
      let loading = await this.loading.create({ message: 'Cargando archivo...' });

      if (fileSize <= 3) {
        formData.append('file', file);

        await loading.present();

        try {
          const response: any={}; //= await this.api.cargarArchivoTicketWeb(formData, params);
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
    }
  }
  async descargarDocumento(record: any, ev: any) {
    let loading = await this.loading.create({ message: 'Descargando...' });

    await loading.present();

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

          FileOpener.open({
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
      this.snackbar.showToast('No pudimos cargar el archivo.', 3000, 'danger');
    }
    finally {
      loading.dismiss();
    }
  }
  async eliminarDocumento(record: any, ev: any) {
    ev.stopPropagation();

    const loading = await this.loading.create({ message: 'Eliminando...' });

    await loading.present();

    try {
      const params = {
        aptiNcorr: this.id,
        aptaNcorr: record.aptaNcorr
      };
      const response = await this.api.eliminarArchivoTicket(params);
      const { data } = response;

      if (data.success) {
        this.documentos = data.documentos;
        this.snackbar.showToast('Archivo eliminado.', 3000, 'success');
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

      this.snackbar.showToast('No pudimos eliminar el archivo.', 3000, 'danger');
    }
    finally {
      loading.dismiss();
    }
  }
  async enviar() {
    if (this.formTicket.valid) {
      const loading = await this.loading.create({ message: 'Procesando...' });

      await loading.present();

      try {
        // const params = {
        //   lclaNcorr: this.libro,
        //   aptiNcorr: this.id,
        //   apttCcod: this.tipo?.value,
        //   aptmTcomentario: this.comentario?.value,
        //   aptaNcorr: 0,
        //   lcmoNlatitud: this.coordinadas ? this.coordinadas.coords.latitude : null,
        //   lcmoNlongitud: this.coordinadas ? this.coordinadas.coords.longitude : null
        // };
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

        loading.dismiss();

        if (data.success) {
          this.cerrar(data.estado);
          this.presentSuccess('Su solicitud ha sido enviada correctamente al equipo de soporte de su Sede.');
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

        this.snackbar.showToast('No pudimos procesar su solicitud. Vuelva a intentar.', 3000, 'danger');
      }
      finally {
        loading.dismiss();
      }
    }
    else {
      this.formTicket.markAllAsTouched();
    }
  }
  async presentSuccess(mensaje: string) {
    this.alertCtrl.create({
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
    }).then(alert => alert.present())
  }
  async cerrar(data?: any) {
    this.modalCtrl.dismiss(data);
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
