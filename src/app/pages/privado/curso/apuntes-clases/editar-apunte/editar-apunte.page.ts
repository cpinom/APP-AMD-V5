import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FileOpener } from '@capacitor-community/file-opener';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { ActionSheetController, IonNav, LoadingController, Platform } from '@ionic/angular';
import * as moment from 'moment';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { ApuntesService } from 'src/app/core/services/curso/apuntes.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { MediaService } from 'src/app/core/services/media.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

@Component({
  selector: 'app-editar-apunte',
  templateUrl: './editar-apunte.page.html',
  styleUrls: ['./editar-apunte.page.scss'],
})
export class EditarApuntePage implements OnInit {

  seccion: any;
  data: any;
  fecha!: string;
  form: FormGroup;

  constructor(private nav: IonNav,
    private pt: Platform,
    private api: ApuntesService,
    private snackbar: SnackbarService,
    private fb: FormBuilder,
    private action: ActionSheetController,
    private media: MediaService,
    private loading: LoadingController,
    private error: ErrorService) {

    this.form = this.fb.group({
      amcoNcorr: [0],
      amcoTobservacion: ['']
    });

  }
  ngOnInit() {
    this.fecha = moment(this.seccion.lclaFclase, 'DD/MM/YYYY').format('dddd DD [de] MMMM, YYYY');

    if (this.data) {
      this.amcoNcorr?.setValue(this.data.amcoNcorr);
      this.amcoTobservacion?.setValue(this.data.amcoTobservacion);
    }
  }
  async adjuntar(input: any) {
    if (!this.pt.is('capacitor')) {
      input.click();
    }
    else {
      const file = await this.media.getMedia();

      if (file) {
        const params = { amcoNcorr: this.amcoNcorr?.value, lclaNcorr: this.seccion.lclaNcorr };
        const fileSize = file?.size! / 1024 / 1024;
        const loading = await this.loading.create({ message: 'Cargando archivo...' });

        if (fileSize <= 3) {
          await loading.present();

          try {
            const respone: any = await this.api.cargarArchivo(file?.path!, file?.name!, params);
            const { data } = respone;

            if (data.success) {
              this.snackbar.showToast('Archivo cargado correctamente.', 3000, 'success');
              this.amcoNcorr?.setValue(data.apunte.amcoNcorr);
              this.data = data.apunte;
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
      let params = { amcoNcorr: this.amcoNcorr?.value, lclaNcorr: this.seccion.lclaNcorr };
      let loading = await this.loading.create({ message: 'Cargando archivo...' });

      if (fileSize <= 3) {
        formData.append('file', file);

        await loading.present();

        try {
          const response: any = await this.api.cargarArchivoWeb(formData, params);
          const { data } = response;

          if (data.success) {
            this.snackbar.showToast('Archivo cargado correctamente', 3000, 'success');
            this.amcoNcorr?.setValue(data.apunte.amcoNcorr);
            this.data = data.apunte;
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
  async guardar() {
    try {
      const params = Object.assign(this.form.value, { lclaNcorr: this.seccion.lclaNcorr });
      const response = await this.api.guardarComentarioClase(params);
      const { data } = response;

      if (data.success) {
        this.snackbar.showToast('Cambios guardados correctamente', 3000, 'success');
        this.amcoNcorr?.setValue(data.apunte.amcoNcorr);
        this.data = data.apunte;
        this.api.marcarVista(VISTAS_DOCENTE.GUARDA_OBSERVACION);
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
    finally { }
  }
  async eliminar() {
    const actionSheet = await this.action.create({
      header: '¿Seguro que quieres eliminar todo?',
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: this.procesarEliminar.bind(this)
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }
  async procesarEliminar() {
    await this.api.eliminarApunteClase({ amcoNcorr: this.data.amcoNcorr });

    this.snackbar.showToast('Cambios guardados correctamente', 3000, 'success');
    this.nav.pop();

    return true;
  }
  async descargarDocumento(record: any, ev: any) {
    let loading = await this.loading.create({ message: 'Descargando...' });

    await loading.present();

    try {
      const params = { amcdNcorr: record.amcdNcorr };
      const response = await this.api.getArchivoApunte(params);
      const { data } = response;

      if (data.success) {
        if (this.pt.is('mobileweb')) {
          const linkSource = `data:${data.data.amcdTtipo};base64,${data.data.amcdBdocumento}`;
          const downloadLink = document.createElement('a');
          downloadLink.href = linkSource;
          downloadLink.download = data.data.amcdTnombre;
          downloadLink.click();
        }
        else {
          const file = await Filesystem.writeFile({
            path: data.data.amcdTnombre,
            data: data.data.amcdBdocumento,
            directory: Directory.Cache
          });

          FileOpener.open({
            filePath: file.uri,
            contentType: data.data.amcdTtipo
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
        lclaNcorr: this.seccion.lclaNcorr,
        amcoNcorr: this.data.amcoNcorr,
        amcdNcorr: record.amcdNcorr,
        amcdTidOnedrive: record.amcdTidOnedrive
      };
      const response = await this.api.eliminarArchivoApunte(params);
      const { data } = response;

      if (data.success) {
        this.snackbar.showToast('Archivo eliminado.', 3000, 'success');
        this.amcoNcorr?.setValue(data.apunte.amcoNcorr);
        this.data = data.apunte;
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
  get amcoNcorr() { return this.form.get('amcoNcorr'); }
  get amcoTobservacion() { return this.form.get('amcoTobservacion'); }

}
