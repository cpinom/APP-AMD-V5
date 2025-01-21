import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FileOpener } from '@capacitor-community/file-opener';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { ActionSheetController, Platform } from '@ionic/angular';
import { ApuntesService } from 'src/app/core/services/curso/apuntes.service';
import { DialogService } from 'src/app/core/services/dialog.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { MediaService } from 'src/app/core/services/media.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-apuntes-clases',
  templateUrl: './apuntes-clases.page.html',
  styleUrls: ['./apuntes-clases.page.scss'],
})
export class ApuntesClasesPage implements OnInit {

  @ViewChild('adjuntosInput') adjuntarEl!: ElementRef;
  mostrarCargando = true;
  mostrarData = false;
  data: any;
  calendario: any[] | undefined;
  libro: any;
  apuntes: any;
  apunte: any;
  documentos: any[] = [];
  modificarApunte = false;
  form: FormGroup;
  agregarApunte = false;

  constructor(private api: ApuntesService,
    private error: ErrorService,
    private dialog: DialogService,
    private pt: Platform,
    private utils: UtilsService,
    private media: MediaService,
    private fb: FormBuilder,
    private action: ActionSheetController,
    private snackbar: SnackbarService) {

    this.form = this.fb.group({
      amcoNcorr: [0],
      amcoTobservacion: ['']
    });

  }

  ngOnInit() {
    Preferences.get({ key: 'Seccion' }).then((result) => {
      this.data = JSON.parse(result.value!);
      this.cargar(true);
    });
  }
  async cargar(forceRefresh: boolean) {
    try {
      const params = { ssecNcorr: this.data.ssecNcorr };
      const response = await this.api.getPrincipal(params, forceRefresh);
      const { data } = response;

      if (data.success) {
        await this.procesarCalendario(data.calendario);
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
  async cargarApuntes(item: any) {

    this.libro = item;
    this.agregarApunte = false;
    this.modificarApunte = false;

    const loading = await this.dialog.showLoading({ message: 'Cargando...' });
    const current = this.calendario?.find(item => item.selected);

    current && (current.selected = false);
    item.selected = !item.selected;

    try {
      const response = await this.api.getApuntesClaseV5(item.lclaNcorr);
      const { data } = response;

      // throw Error();

      if (data.success) {
        this.apuntes = data.apuntes;
        this.agregarApunte = this.apuntes.length == 0;
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

      item.selected = false;
    }
    finally {
      await loading.dismiss();
    }

  }
  async procesarCalendario(data: any) {
    debugger
    try {
      this.calendario = data;

      if (this.libro) {
        // const current = this.calendario?.find(item => item.lclaNcorr == this.libro.lclaNcorr);
        // current && (current.selected = true);
      }
      else {
        if (this.calendario && this.calendario.length > 0) {
          await this.cargarApuntes(this.calendario[0]);
          // this.libro = this.calendario[0];
          // this.libro.selected = true;
        }

      }

      return Promise.resolve();
    }
    catch {
      return Promise.reject();
    }
  }
  recargar(e?: any) { }
  async adjuntarArchivo(inputEl: any) {
    if (this.pt.is('mobileweb')) {
      inputEl.click();
    }
    else {
      const media = await this.media.getMedia();

      if (media) {
        const fileSize = media.size / 1024 / 1024;
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
  async adjuntar(event: any) {
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
  }
  async uploadBase64Fragmented(base64String: string, fileName: string): Promise<void> {
    const fragments = this.utils.divideBase64(base64String);
    const totalParts = fragments.length;
    const loading = await this.dialog.showLoading({ message: 'Cargando archivo...' });
    const amcoNcorr = this.amcoNcorr?.value;
    const lclaNcorr = this.libro.lclaNcorr;
    const ssecNcorr = this.data.ssecNcorr;

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

        const response = await this.api.cargarArchivoV5(amcoNcorr, lclaNcorr, ssecNcorr, params);
        const result = response.data;

        if (result.success) {
          if (result.code == 202) {
            const progreso = Math.round(result.progress);
            loading.message = `(${progreso}%) procesando....`;
          }
          else if (result.code == 200) {
            await this.procesarCalendario(result.data.calendario);
            this.amcoNcorr?.setValue(result.data.apunte.amcoNcorr);
            this.amcoTobservacion?.setValue(result.data.apunte.amcoTobservacion);
            this.documentos = result.data.apunte.documentos;
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
  async guardarApunte() {
    if (this.form.valid) {
      const loading = await this.dialog.showLoading({ message: 'Guardando apunte...' });

      try {
        const params = Object.assign(this.form.value, { lclaNcorr: this.libro.lclaNcorr, ssecNcorr: this.data.ssecNcorr });
        const response = await this.api.guardarComentarioClaseV5(params);
        const result = response.data;

        if (result.success) {
          await loading.dismiss();
          await this.procesarCalendario(result.data.calendario);
          this.apuntes.push(result.data.apunte);
          this.agregarApunte = false;
          this.snackbar.showToast('Apunte guardado correctamente', 3000, 'success');
          this.amcoNcorr?.setValue(0);
          this.amcoTobservacion?.setValue('');
        }
        else {
          throw Error(result);
        }
      }
      catch (error: any) {
        if (error && error.status == 401) {
          this.error.handle(error);
          return;
        }

        await this.presentError('Guardar Apunte', 'No se pudo guardar el apunte. Vuelve a intentarlo.');
      }
      finally {
        await loading.dismiss();
      }
    }
  }
  async editarApunte(item: any) {
    this.apunte = item;
    this.modificarApunte = true;
    this.amcoNcorr?.setValue(item.amcoNcorr);
    this.amcoTobservacion?.setValue(item.amcoTobservacion);
  }
  cancelarEditar() {
    this.apunte = undefined
    this.modificarApunte = false;
    this.amcoNcorr?.setValue(0);
    this.amcoTobservacion?.setValue('');
  }
  async eliminarApunte() {
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
    const loading = await this.dialog.showLoading({ message: 'Eliminando apunte...' });
    const amcoNcorr = this.apunte.amcoNcorr;
    const lclaNcorr = this.libro.lclaNcorr;
    const ssecNcorr = this.data.ssecNcorr;

    try {
      const response = await this.api.eliminarApunteClaseV5(ssecNcorr, lclaNcorr, amcoNcorr);

      if (response.success) {
        const { data } = response;
        await this.procesarCalendario(data.calendario);
        // this.calendario = data.calendario;
        this.apuntes = data.apuntes;
        this.agregarApunte = this.apuntes.length == 0;
        this.modificarApunte = false;
        this.snackbar.showToast('Cambios guardados correctamente', 3000, 'success');
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

      await this.presentError('Eliminar Apunte', 'No se pudo eliminar el apunte. Vuelve a intentarlo.');
    }
    finally {
      await loading.dismiss();
    }

    return true;
  }
  async archivoTap(apunte: any, item: any) {
    const actionSheet = await this.action.create({
      header: '¿Qué deseas hacer?',
      buttons: [
        {
          text: 'Descargar',
          handler: this.descargarDocumento.bind(this, apunte, item)
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: this.eliminarDocumento.bind(this, apunte, item)
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }
  async descargarDocumento(apunte: any, item: any) {
    const loading = await this.dialog.showLoading({ message: 'Descargando...' });

    try {
      const params = { amcdNcorr: item.amcdNcorr };
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

      await this.presentError('Descargar Archivo', 'No se pudo descargar el archivo. Vuelve a intentarlo.');
    }
    finally {
      await loading.dismiss();
    }
  }
  async eliminarDocumento(apunte: any, item: any) {
    const loading = await this.dialog.showLoading({ message: 'Eliminando...' });

    try {
      const ssecNcorr = this.data.ssecNcorr;
      const lclaNcorr = this.libro.lclaNcorr;
      const amcoNcorr = apunte.amcoNcorr;
      const amcdNcorr = item.amcdNcorr;
      const amcdTidOnedrive = item.amcdTidOnedrive;

      const response = await this.api.eliminarArchivoApunteV5(ssecNcorr, lclaNcorr, amcoNcorr, amcdNcorr, amcdTidOnedrive);

      if (response.success) {
        const { data } = response;
        await this.procesarCalendario(data.calendario);

        const apunte = this.apuntes.find((item: any) => item.amcoNcorr == data.apunte.amcoNcorr);
        apunte.amcoTobservacion = data.apunte.amcoTobservacion;
        apunte.documentos = data.apunte.documentos;
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
  async presentError(title: string, message: string) {
    const alert = await this.dialog.showAlert({
      cssClass: 'alert-message',
      message: `<img src="./assets/images/warning.svg" /><br />${message}`,
      header: title,
      buttons: ['Aceptar']
    });

    return alert;
  }
  get amcoNcorr() { return this.form.get('amcoNcorr'); }
  get amcoTobservacion() { return this.form.get('amcoTobservacion'); }

}
