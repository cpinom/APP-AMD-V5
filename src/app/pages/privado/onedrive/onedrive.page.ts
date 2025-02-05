import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FileOpener } from '@capacitor-community/file-opener';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { ActionSheetController, AlertButton, AlertController, NavController, Platform } from '@ionic/angular';
import * as moment from 'moment';
import { AppGlobal } from 'src/app/app.global';
import { DialogService } from 'src/app/core/services/dialog.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { MediaService } from 'src/app/core/services/media.service';
import { OnedriveService } from 'src/app/core/services/onedrive.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { CompartirPage } from './compartir/compartir.page';

@Component({
  selector: 'app-onedrive',
  templateUrl: './onedrive.page.html',
  styleUrls: ['./onedrive.page.scss'],
})
export class OnedrivePage implements OnInit {

  @ViewChild('adjuntosInput') adjuntarEl!: ElementRef;
  driveId: string = '';
  items: any;
  mostrarCargando = true;
  mostrarData = false;

  constructor(private api: OnedriveService,
    private error: ErrorService,
    private utils: UtilsService,
    private global: AppGlobal,
    private nav: NavController,
    private dialog: DialogService,
    private pt: Platform,
    private alert: AlertController,
    private action: ActionSheetController,
    private media: MediaService,
    private snackbar: SnackbarService) {

    moment.locale('es');

  }

  async ngOnInit() {
    await this.cargar();
  }
  async cargar(force?: boolean) {
    const driveIdStoraged = await this.api.getStorage('driveId');

    if (driveIdStoraged != null) {
      this.driveId = driveIdStoraged;
    }

    if (force === true) {
      this.driveId = '';
    }

    this.mostrarCargando = true;

    try {
      const response = await this.api.getPrincipal(this.driveId);
      const result = response.data;

      if (result.success) {
        const { data } = result;
        this.driveId = data.driveId;
        this.items = data.items;
        this.mostrarData = true;
        await this.api.setStorage('driveId', this.driveId)
      }
      else {
        throw Error();
      }
    }
    catch (error: any) {
      if (error && error.status == 401) {
        this.error.handle(error);
        return
      }
    }
    finally {
      this.mostrarCargando = false;
    }
  }
  recargar(e: any) {
    this.mostrarCargando = false;
    this.cargar(true).finally(() => {
      e.target.complete();
    })
  }
  async itemTap(item: any) {
    if (item.folder) {
      await this.nav.navigateForward(`privado/onedrive/${item.id}/${item.name}`);
    }
    else if (item.file) {
      await this.descargarTap(item);
    }
  }
  async fabTap(inputEl: any) {
    const actionSheet = await this.action.create({
      header: 'OneDrive',
      buttons:
        [
          {
            text: 'Crear Carpeta',
            handler: () => {
              this.crearCarpetaTap();
            }
          },
          {
            text: 'Subir Archivo',
            handler: () => {
              this.agregarArchivoTap(inputEl);
            }
          },
          {
            text: 'Cancelar',
            role: 'cancel'
          }
        ]
    });

    await actionSheet.present();
  }
  async crearCarpetaTap() {
    const nombreCarpeta = await this.confimarNombreCarpeta();

    if (nombreCarpeta) {
      const loading = await this.dialog.showLoading({ message: 'Creando...' });

      try {
        const response = await this.api.crearCarpeta({
          carpeta: nombreCarpeta,
          driveId: this.driveId
        });
        const result = response.data;

        if (result.success) {
          this.items = result.items;
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

        this.snackbar.showToast('La carpeta no pudo ser creada.', 3000, 'danger')
      }
      finally {
        await loading.dismiss();
      }
    }
  }
  async agregarArchivoTap(inputEl: any) {
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

        const response = await this.api.cargarArchivo(this.driveId, params);
        const result = response.data;

        if (result.success) {
          if (result.code == 202) {
            const progreso = Math.round(result.progress);
            loading.message = `(${progreso}%) procesando....`;
          }
          else if (result.code == 200) {
            this.items = result.data.items;
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
  async descargarTap(file: any) {
    const loading = await this.dialog.showLoading({ message: 'Descargando...' });

    try {
      const response = await this.api.descargarArchivo(this.driveId, file.id);
      const result = response.data;

      if (result.success) {
        if (this.pt.is('mobileweb')) {
          const linkSource = `data:${file.contentType};base64,${result.data}`;
          const downloadLink = document.createElement('a');
          downloadLink.href = linkSource;
          downloadLink.download = file.name;
          downloadLink.click();
        }
        else {
          const fileResult = await Filesystem.writeFile({
            path: file.name,
            data: result.data,
            directory: Directory.Cache
          });

          FileOpener.open({
            filePath: fileResult.uri,
            contentType: file.contentType
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

      //this.snackbar.showToast('El archivo no se encuentra disponible.', 3000, 'danger')
    }
    finally {
      await loading.dismiss();
    }
  }
  async compartirTap(file: any) {

    await this.dialog.showModal({
      component: CompartirPage,
      componentProps: {
        data: file
      }
    })
    /*debugger

    const response1 = await this.api.getCursos();

    const params = {
      driveId: this.driveId,
      fileId: file.id,
      destinatarios: ['vandit.va@gmail.com'].join(',')
    };
    const response = await this.api.compartirArchivo(params);
    debugger*/
  }
  async optionsTap(item: any, e: any) {
    e.stopPropagation();

    let buttons: any;

    if (item.folder) {
      buttons = [
        {
          text: 'Cambiar nombre',
          handler: () => {
            this.renombrarCarpetaTap(item);
          }
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarTap(item);
          }
        }
      ];
    }
    else if (item.file) {
      buttons = [
        {
          text: 'Descargar',
          handler: () => {
            this.descargarTap(item);
          }
        },
        {
          text: 'Compartir',
          handler: () => {
            this.compartirTap(item);
          }
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarTap(item);
          }
        }
      ]
    }

    buttons.push({
      text: 'Cancelar',
      role: 'cancel'
    });

    const actionSheet = await this.action.create({
      header: item.name,
      buttons: buttons
    });

    await actionSheet.present();
  }
  async eliminarTap(file: any) {
    const loading = await this.dialog.showLoading({ message: 'Eliminando...' });

    try {
      const result = await this.api.eliminarArchivo(this.driveId, file.id);

      if (result.success) {
        this.items = result.items;
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

      // this.snackbar.showToast('No se pudo eliminar el archivo.', 3000, 'danger')
    }
    finally {
      await loading.dismiss();
    }
  }
  async renombrarCarpetaTap(folder: any) {
    const nombreCarpeta = await this.confimarNombreCarpeta(folder);

    if (nombreCarpeta) {
      const loading = await this.dialog.showLoading({ message: 'Actualizando...' });

      try {
        const result = await this.api.renombrarCarpeta({
          driveId: this.driveId,
          folderId: folder.id,
          carpeta: nombreCarpeta
        });

        if (result.success) {
          this.items = result.items;
        }
        else if (result.message) {
          this.snackbar.showToast(result.message, 3000, 'danger');
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

        // this.snackbar.showToast('La carpeta no pudo ser renombrada.', 3000, 'danger')
      }
      finally {
        await loading.dismiss();
      }
    }
  }
  confimarNombreCarpeta(item?: any): Promise<string> {
    return new Promise((resolve) => {
      let buttons: AlertButton[];

      if (item) {
        buttons = [
          {
            text: 'Cambiar nombre',
            role: 'destructive',
            handler: (item) => {
              resolve(item.name);
            }
          },
          {
            text: 'Cancelar'
          }
        ];
      }
      else {
        buttons = [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Crear',
            handler: (item) => {
              resolve(item.name);
            }
          }
        ];
      }

      this.alert.create({
        header: item ? 'Cambiar nombre' : 'Nombre de carpeta',
        inputs: [
          {
            name: 'name',
            type: 'text',
            value: item ? item.name : null,
            placeholder: 'Nueva carpeta'
          }
        ],
        buttons: buttons
      }).then(alert => alert.present());
    });
  }
  resolverMiniatura(fileId: string) {
    return `${this.global.Api}/api/onedrive/v1/thumbnail?driveId=${this.driveId}&fileId=${fileId}`;
  }
  resolverIcono(path: string) {
    return this.utils.resolveIcon(path);
  }
  resolverFecha(fecha: string) {
    const fechaMoment = moment(fecha, "DD/MM/YYYY HH:mm", true);

    // Comparar con la fecha actual
    const hoy = moment();

    if (fechaMoment.isSame(hoy, 'day')) {
      return `Hoy a las ${fechaMoment.format("HH:mm")}`;
    }
    else if (fechaMoment.isSame(hoy.clone().subtract(1, 'day'), 'day')) {
      return `Ayer a las ${fechaMoment.format("HH:mm")}`;
    }
    else if (fechaMoment.isSame(hoy, 'week')) {
      return `${fechaMoment.format("[El] dddd [a las] HH:mm")}`; // Día de la semana y hora
    }

    // Por defecto, retornar la fecha original formateada
    return fecha;
  }
  isImage(path: string): boolean {
    return this.utils.isImage(path);
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

}
