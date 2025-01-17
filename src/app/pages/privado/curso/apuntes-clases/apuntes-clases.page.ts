import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
        this.calendario = data.calendario;

        if (this.calendario?.length) {
          this.cargarApuntes(this.calendario[0]);
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

        const response = await this.api.cargarArchivoV5(amcoNcorr, lclaNcorr, params);
        const result = response.data;

        if (result.success) {
          if (result.code == 202) {
            const progreso = Math.round(result.progress);
            loading.message = `(${progreso}%) procesando....`;
          }
          else if (result.code == 200) {
            this.amcoNcorr?.setValue(result.data.amcoNcorr);
            this.amcoTobservacion?.setValue(result.data.amcoTobservacion);
            this.documentos = result.data.documentos;
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
      const params = Object.assign(this.form.value, { lclaNcorr: this.libro.lclaNcorr, ssecNcorr: this.data.ssecNcorr });
      const response = await this.api.guardarComentarioClaseV5(params);
      const result = response.data;

      if (result.success) {
        this.calendario = result.data.calendario;
        this.apuntes.push(result.data.apunte);
        this.agregarApunte = false;
        this.snackbar.showToast('Apunte guardado correctamente', 3000, 'success');
        this.amcoNcorr?.setValue(0);
        this.amcoTobservacion?.setValue('');
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

      debugger
      if (response.success) {
        const { data } = response;
        this.calendario = data.calendario;
        this.apuntes = data.apuntes;
        this.agregarApunte = this.apuntes.length == 0;
        this.modificarApunte = false;
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
      await loading.dismiss();
    }

    this.snackbar.showToast('Cambios guardados correctamente', 3000, 'success');

    return true;
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
