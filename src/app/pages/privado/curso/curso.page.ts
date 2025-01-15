import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { AppGlobal } from 'src/app/app.global';
import { PrivateService } from 'src/app/core/services/private.service';
import { VISTAS_DOCENTE } from 'src/app/app.contants';

@Component({
  selector: 'app-curso',
  templateUrl: './curso.page.html',
  styleUrls: ['./curso.page.scss'],
})
export class CursoPage implements OnInit, OnDestroy {

  data: any;

  constructor(public router: Router,
    private nav: NavController,
    private global: AppGlobal,
    private api: PrivateService) {
    this.data = this.router.getCurrentNavigation()?.extras.state;
  }
  async ngOnInit() {
    if (!this.data) {
      await this.nav.navigateBack('/privado');
      return;
    }

    await Preferences.set({
      key: 'Seccion',
      value: JSON.stringify(this.data)
    });

    this.api.marcarVista(VISTAS_DOCENTE.CURSO);
  }
  async ngOnDestroy() {
    await Preferences.remove({ key: 'Seccion' });
  }
  async principalTap(e: any) {
  }
  get appConnected() {
    return this.global.IsConnected;
  }
}
