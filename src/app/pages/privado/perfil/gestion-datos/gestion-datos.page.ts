import { Component, OnInit } from '@angular/core';
import { IonNav } from '@ionic/angular';
import { EditarCorreoPage } from './editar-correo/editar-correo.page';
import { EditarTelefonoPage } from './editar-telefono/editar-telefono.page';
import { AuthService } from 'src/app/core/auth/auth.service';
import { EventsService } from 'src/app/core/services/events.services';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { PrivateService } from 'src/app/core/services/private.service';

@Component({
  selector: 'app-gestion-datos',
  templateUrl: './gestion-datos.page.html',
  styleUrls: ['./gestion-datos.page.scss'],
})
export class GestionDatosPage implements OnInit {

  perfil: any;
  permitirEditar = true;

  constructor(private nav: IonNav,
    private auth: AuthService,
    private events: EventsService,
    private api: PrivateService) {

    this.events.onEmailUpdate.subscribe((user) => {
      this.perfil = user;
    });

    this.events.onPhoneUpdate.subscribe((user) => {
      this.perfil = user;
    });

  }

  ngOnInit() {
    this.auth.getAuth().then(auth => {
      this.perfil = auth.user;
    });

    this.api.marcarVista(VISTAS_DOCENTE.PERFIL_DATOS);
  }
  async editarCorreo() {
    await this.nav.push(EditarCorreoPage);
  }
  async editarTelefono() {
    await this.nav.push(EditarTelefonoPage);
  }

}
