import { Component, OnInit } from '@angular/core';
import { IonNav, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/core/auth/auth.service';
import { GestionDatosPage } from '../gestion-datos/gestion-datos.page';
import { GestionPinPage } from '../gestion-pin/gestion-pin.page';
import { AppGlobal } from '../../../../app.global';
import { PerfilService } from 'src/app/core/services/perfil.service';
import { ErrorService } from 'src/app/core/services/error.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { EventsService } from 'src/app/core/services/events.services';
import { PrivateService } from 'src/app/core/services/private.service';
import { VISTAS_DOCENTE } from 'src/app/app.contants';

enum Pages {
  GestionPinPage = 1,
  GestionFotoPage = 2,
  GestionDatosPage = 3
}

@Component({
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
})
export class PrincipalPage implements OnInit {

  mostrarPin: boolean | undefined;
  user: any;
  modoOscuro: boolean | undefined;
  mostrarFoto = true;

  constructor(private modal: ModalController,
    private nav: IonNav,
    private auth: AuthService,
    private global: AppGlobal,
    private perfil: PerfilService,
    private error: ErrorService,
    private snackbar: SnackbarService,
    private events: EventsService,
    private api: PrivateService) {

    this.events.onPhotoUpdate.subscribe(() => {
      this.mostrarFoto = false;
      setTimeout(() => {
        this.mostrarFoto = true;
      }, 500);
    })

  }

  async ngOnInit() {
    this.user = (await this.auth.getAuth()).user;

    if (this.mostrarPin) {
      await this.navigate(Pages.GestionPinPage);
      return;
    }

    let preferencias = await this.perfil.getStorage('preferencias');

    if (preferencias) {
      this.modoOscuro = preferencias.oscuro === true;
    }

    this.api.marcarVista(VISTAS_DOCENTE.PERFIL);
  }
  resolverFoto() {
    return `${this.global.Api}/api/v4/avatar/${this.user.persNcorr}`;
  }
  async navigate(page: Pages) {
    switch (page) {
      case Pages.GestionPinPage:
        await this.nav.push(GestionPinPage);
        break;
      case Pages.GestionDatosPage:
        await this.nav.push(GestionDatosPage);
        break;
    }
  }
  async aplicarModo(ev: any) {
    let preferencias = await this.perfil.getStorage('preferencias');
    preferencias.oscuro = this.modoOscuro;

    this.perfil.toggleBodyClass('dark');
    this.sincronizarPreferencias(preferencias);

    if (this.modoOscuro) {
      this.api.marcarVista(VISTAS_DOCENTE.PERFIL_MODO_OSCURO);
    }
  }
  async sincronizarPreferencias(preferencias: any) {
    try {
      const response = await this.perfil.guardarPreferencias(preferencias);
      const { data } = response;

      if (data.success) {
        await this.perfil.setStorage('preferencias', preferencias);
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

      this.modoOscuro = !this.modoOscuro;
      this.perfil.toggleBodyClass('dark');
      this.snackbar.showToast('No se pudieron guardar los cambios.');
    }
  }
  async logout() {
    this.modal.dismiss();
    this.auth.tryLogout();
  }
  async cerrar() {
    await this.modal.dismiss();
  }
}
