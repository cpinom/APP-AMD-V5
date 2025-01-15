import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AppGlobal } from '../../../../app.global';
import { AuthService } from 'src/app/core/auth/auth.service';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { MediaService } from 'src/app/core/services/media.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { PerfilService } from 'src/app/core/services/perfil.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { EventsService } from 'src/app/core/services/events.services';
import { VISTAS_DOCENTE } from 'src/app/app.contants';

const CACHE_FOLDER = 'CACHED-IMG';

@Component({
  selector: 'app-gestion-foto',
  templateUrl: './gestion-foto.page.html',
  styleUrls: ['./gestion-foto.page.scss'],
})
export class GestionFotoPage implements OnInit {

  @ViewChild('fotoInput') fotoEl!: ElementRef;
  user: any;
  base64!: any;
  foto: any;
  refresh = false;
  urlFoto!: string;

  constructor(private global: AppGlobal,
    private auth: AuthService,
    private pt: Platform,
    private media: MediaService,
    private loading: LoadingController,
    private snackbar: SnackbarService,
    private utils: UtilsService,
    private api: PerfilService,
    private error: ErrorService,
    private events: EventsService,
    private alertCtrl: AlertController) { }

  ngOnInit() {
    this.auth.getAuth().then(auth => {
      this.user = auth.user;
      this.resolverFoto();
    });

    this.api.marcarVista(VISTAS_DOCENTE.PERFIL_FOTO);
  }
  resolverFoto() {
    this.urlFoto = `${this.global.Api}/api/v4/avatar/${this.user.persNcorr}?t=` + new Date().getTime();
  }
  async upload(input: any) {
    if (!this.pt.is('capacitor')) {
      input.click();
    }
    else {
      const file = await this.media.getMedia(true);

      if (file) {
        const fileSize = file?.size! / 1024 / 1024;

        if (fileSize <= 3) {
          this.foto = file;
          this.base64 = file.data;
        }
      }
      else {
        this.snackbar.showToast('La imagen no pueden exceder los 3 MB.', 2000);
      }
    }
  }
  async uploadWeb(event: any) {
    if (event.target.files.length > 0) {
      let file = event.target.files[0];
      let fileSize = file.size / 1024 / 1024;

      if (fileSize <= 3) {
        this.foto = file;
        this.base64 = await this.utils.convertBlobToBase64(file);
        this.fotoEl.nativeElement.value = null;

      } else {
        this.snackbar.showToast('La imagen no puede exceder los 3 MB.', 3000)
      }
    }
  }
  async guardar() {
    if (this.pt.is('mobileweb')) {
      let loading = await this.loading.create({ message: 'Cargando foto...' });
      let formData = new FormData();
      formData.append('file', this.foto);

      await loading.present();

      try {
        const response: any = await this.api.cargarFotoPerfilWeb(formData, {});
        const { data } = response;

        if (data.success) {
          const imageUrl = `${this.global.Api}/api/v4/avatar/${this.user.persNcorr}`;
          const imageName = imageUrl.split('/').pop();

          await Filesystem.deleteFile({
            directory: Directory.Cache,
            path: `${CACHE_FOLDER}/${imageName}`
          });

          this.snackbar.showToast('Archivo cargado correctamente', 3000, 'success');
          this.base64 = undefined;
          this.resolverFoto();
          this.events.onPhotoUpdate.next({});
        }
        else {
          this.base64 = undefined;
          this.presentFail(data.message);
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
      let loading = await this.loading.create({ message: 'Cargando foto...' });

      loading.present();

      try {
        const file = this.foto;
        const response: any = await this.api.cargarFotoPerfil(file.path, file.name, {});
        const { data } = response;

        if (data.success) {
          const imageUrl = `${this.global.Api}/api/v4/avatar/${this.user.persNcorr}`;
          const imageName = imageUrl.split('/').pop();

          await Filesystem.deleteFile({
            directory: Directory.Cache,
            path: `${CACHE_FOLDER}/${imageName}`
          });

          this.snackbar.showToast('Archivo cargado correctamente', 3000, 'success');
          this.base64 = undefined;
          this.resolverFoto();
          this.events.onPhotoUpdate.next({});
        }
        else {
          this.base64 = undefined;
          this.presentFail(data.message);
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
  }
  presentFail(message: string) {
    this.alertCtrl.create({
      header: 'Foto Perfil',
      message: message,
      buttons: [{
        text: 'Aceptar'
      }]
    }).then(alert => alert.present());
  }
}
