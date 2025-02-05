import { Component, OnInit } from '@angular/core';
import { ActionSheetController, IonNav } from '@ionic/angular';
import { DialogService } from 'src/app/core/services/dialog.service';
import { DispositivoService } from 'src/app/core/services/dispositivo.service';
import { EventsService } from 'src/app/core/services/events.services';

@Component({
  selector: 'app-reemplazar-tablet',
  templateUrl: './reemplazar-tablet.page.html',
  styleUrls: ['./reemplazar-tablet.page.scss'],
})
export class ReemplazarTabletPage implements OnInit {

  data: any;
  tabletSeleccionada: any;
  tabletFiltro = '';
  tablets: any;
  tabletsFiltradas: any;

  constructor(private action: ActionSheetController,
    private dialog: DialogService,
    private api: DispositivoService,
    private nav: IonNav,
    private events: EventsService) { }

  ngOnInit() {
    this.tablets = this.getTablets();
    this.tabletsFiltradas = this.tablets;
  }
  resaltarTexto(item: any) {
    let returnValue = `<h2>Código Tablet - ${item.aptaCtablets}</h2><p>UUID - ${item.aptaTuui}</p>`;

    if (this.tabletFiltro.length) {
      const filtro = this.tabletFiltro.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase();
      let texto = returnValue.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase();
      let startIndex = texto.indexOf(filtro);

      if (startIndex != -1) {
        let endLength = filtro.length;
        let matchingString = returnValue.substr(startIndex, endLength);
        return returnValue.replace(matchingString, "<b>" + matchingString + "</b>");
      }
    }

    return returnValue;
  }
  filtrarTablets() {
    this.tabletSeleccionada = null;
    this.tabletsFiltradas = this.tablets.filter((item: any) => {
      let text = item.aptaCtablets.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase();
      text += item.aptaTuui.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase();
      let filter = this.tabletFiltro.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase();
      let index = text.indexOf(filter);

      return index > -1;
    });
  }
  resetTablets() {
    this.tabletSeleccionada = null;
    this.tabletFiltro = '';
    this.tabletsFiltradas = this.tablets;
  }
  getTablets() {
    try {
      return this.data.tablets.filter((t: any) => t.aptaNcorr != this.data.tablet.aptaNcorr);
    } catch { }

    return [];
  }
  async reemplazarTap() {
    const tablet = this.tabletSeleccionada;
    const confirm = await this.confirmarReemplazo();

    if (confirm == true) {
      const loading = await this.dialog.showLoading({ message: 'Procesando...' });
      const params = {
        amseTpin: this.data.amseTpin,
        sedeCcod: this.data.sedeCcod,
        aptaTuuid: tablet.aptaTuui,
        aptaNcorr: this.data.tablet.aptaNcorr,
        aptaCtablets: tablet.aptaCtablets,
        aptaNserie: tablet.aptaNserie
      };

      try {
        const response = await this.api.actualizarTabletV5(params);
        const { data } = response;

        if (data.success) {
          await loading.dismiss();
          
          if (data.data.codigo == 3) {
            this.events.app.next(data.data);
            await this.presentSuccess('Configuración Dispositivo', 'Tablet migrada correctamente.');
            await this.nav.pop();
          }
          else if (data.data.codigo == 4) {
            await this.presentError('Configuración Dispositivo', 'El nuevo ID APP ingresado no corresponde a un código valido.');
          }
        }
        else {
          throw new Error();
        }
      }
      catch (error: any) {
        await this.presentError('Configuración Dispositivo', 'Ha ocurrido un error inesperado.');
      }
      finally {
        await loading.dismiss();
      }
    }
  }
  async confirmarReemplazo(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const actionSheet = await this.action.create({
        header: '¿Seguro que quieres reemplazar la tablet?',
        buttons: [
          {
            text: 'Sí, Continuar',
            role: 'destructive',
            handler: () => {
              resolve(true);
            }
          },
          {
            text: 'Cancelar',
            role: 'cancel'
          }
        ]
      });

      await actionSheet.present();
    });
  }
  async presentSuccess(title: string, message: string) {
    const alert = await this.dialog.showAlert({
      backdropDismiss: false,
      keyboardClose: false,
      cssClass: 'success-alert',
      header: title,
      message: `<div class="image"><ion-icon src = "./assets/icon/check_circle.svg"></ion-icon></div>${message}`,
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

}
