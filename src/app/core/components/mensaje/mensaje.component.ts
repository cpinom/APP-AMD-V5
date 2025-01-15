import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AlertController, IonTextarea, LoadingController, ModalController, Platform } from '@ionic/angular';
import { InacapmailService } from '../../services/inacapmail.service';
import { Observable, Subscription, debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MediaService } from '../../services/media.service';
import { UtilsService } from '../../services/utils.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SnackbarService } from '../../services/snackbar.service';
import { ErrorService } from '../../services/error.service';
import * as moment from 'moment';

@Component({
  selector: 'app-mensaje',
  templateUrl: './mensaje.component.html',
  styleUrls: ['./mensaje.component.scss'],
})
export class MensajeComponent implements OnInit, OnDestroy {

  @ViewChild('correoInput') correoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('cuerpo') cuerpoInput!: IonTextarea;
  @ViewChild('contenido') messageEl!: ElementRef;

  messageId: string | undefined;
  isReply = false;
  message: any;
  correo: string | undefined;
  asunto: string | undefined;
  cuerpo: string | undefined;
  correos: string[] = [];
  users!: any[];
  correosFiltrados: Observable<any[]> | undefined;
  separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];

  mensajeForm!: FormGroup;
  emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";
  emailInitial = false;
  correoCtrl = new FormControl('');
  adjuntos: any[] = [];
  toSubscription!: Subscription;
  bodySubscription!: Subscription;

  procesando = false;
  actualizaMensaje = false;
  mostrarAsunto = true;

  constructor(private modalCtrl: ModalController,
    private api: InacapmailService,
    private fb: FormBuilder,
    private pt: Platform,
    private media: MediaService,
    private utils: UtilsService,
    private domSanitizer: DomSanitizer,
    private snackbar: SnackbarService,
    private loading: LoadingController,
    private error: ErrorService,
    private alertCtrl: AlertController,
    private renderer: Renderer2) {

    this.mensajeForm = this.fb.group({
      para: [''],
      asunto: [''],
      cuerpo: ['', Validators.required]
    });

    this.habilitarEventos();

  }
  async ngOnInit() {

    if (this.isReply) {
      this.emailInitial = true;
      this.mostrarAsunto = false;
      this.correos.push(this.message.from.emailAddress.address);
      this.body?.setValue('\n\n\n\n\n\n\n\n\nEnviado desde Ambiente Móvil Docente AMD', { emitEvent: false });

      setTimeout(() => {
        this.cuerpoInput.setFocus();
        this.bindMessageBody();
      }, 700);
    }
    else {
      await this.procesarCuentas();

      this.correosFiltrados = this.correoCtrl.valueChanges.pipe(
        startWith(null),
        map((correo: any | null) => {
          return (correo ? this._filter(correo) : this.users.slice())
        }),
      );

      if (this.correo) {
        this.emailInitial = true;
        this.correos = [this.correo];

      }

      if (!this.emailInitial) {
        setTimeout(() => {
          this.correoInput.nativeElement.focus();
        }, 700);
      }

      if (this.asunto) {
        this.subject?.setValue(this.asunto, { emitEvent: false });
      }

      if (this.cuerpo) {
        this.body?.setValue(this.cuerpo, { emitEvent: false });
      }
      else {
        this.body?.setValue('\n\n\n\n\n\n\n\n\nEnviado desde Ambiente Móvil Docente AMD', { emitEvent: false });
      }
    }
  }
  async ngOnDestroy() {
    this.deshabilitarEventos();

    if (this.messageId) {
      this.api.deleteMessage(this.messageId).catch((error: any) => {
        if (error && error.status == 401) {
          this.error.handle(error);
        }
      });
    }
  }
  async procesarCuentas() {
    try {
      const response = await this.api.getCorreos();
      const { data } = response;

      if (data.success) {
        this.users = data.correos;
      }
      else {
        throw Error();
      }
    }
    catch {
      this.users = [];
    }
  }
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value && value.match(this.emailPattern)) {
      this.correos.push(value);
    }

    event.chipInput!.clear();

    this.correoCtrl.setValue(null);
    this.updateMessage();
  }
  remove(correo: string): void {
    if (!this.emailInitial) {
      const index = this.correos.indexOf(correo);

      if (index >= 0) {
        this.correos.splice(index, 1);
        this.updateMessage();
      }
    }
  }
  selected(event: MatAutocompleteSelectedEvent): void {
    this.correos.push(event.option.value.correo);
    this.correoInput.nativeElement.value = '';
    this.correoCtrl.setValue(null);
    this.updateMessage();
  }
  _filter(value: any): any[] {
    const filterValue = (value.correo || value).toLowerCase() || '';
    const users = this.users.filter(user => user.correo.toLowerCase().includes(filterValue) || user.nombre.toLowerCase().includes(filterValue));

    if (users.length == 0 && (filterValue && filterValue.match(this.emailPattern))) {
      return [{ correo: filterValue, nombre: filterValue }];
    }

    return users;
  }
  bindMessageBody() {
    if (this.isReply) {
      let links = this.messageEl.nativeElement.querySelectorAll('a[href]');

      if (links) {
        Array.from(links).forEach((link: any) => {
          this.renderer.listen(link, 'click', (e) => {
            e.preventDefault();
            let url = link['href'];
            this.utils.openLink(url);
          });
        });
      }
    }
  }
  async adjuntarArchivos(inputEl: any) {
    if (this.pt.is('mobileweb')) {
      inputEl.click();
    } else {
      const file = await this.media.getMedia();

      if (file) {
        let fileSize = file.size / 1024 / 1024;
        let index = this.adjuntos.length;

        if (fileSize <= 3) {
          this.adjuntos.push({});
          this.actualizaMensaje = true;

          try {
            const response: any = await this.api.addAttachment(file.path, file.name, { messageId: this.messageId });
            const { data } = response;

            if (data.success) {
              this.adjuntos[index] = {
                id: data.id,
                name: file.name,
                type: data.type,
                size: data.size,
                content: file?.data
              };
            }
          }
          catch (error: any) {
            if (error && error.status == 401) {
              this.error.handle(error);
              return;
            }
            this.adjuntos.splice(index, 1);
            this.snackbar.showToast('No fue posible cargar el archivo.', 2000);
          }
          finally {
            this.actualizaMensaje = false;
          }
        } else {
          this.snackbar.showToast('Los documentos no pueden exceder los 3 MB.', 2000);
        }
      }
    }
  }
  async adjuntar(ev: any) {
    let formData = new FormData();
    let file = ev.target.files[0];
    var fileSize = file.size / 1024 / 1024;
    let index = this.adjuntos.length;

    if (fileSize <= 3) {
      formData.append('file', file);
      this.adjuntos.push({});
      this.actualizaMensaje = true;

      try {
        const response = await this.api.addAttachmentWeb(formData, { messageId: this.messageId });
        const { data } = response;

        if (data.success) {
          let base64 = await this.utils.convertBlobToBase64(file) as string;

          this.adjuntos[index] = {
            id: data.id,
            name: file.name,
            type: file.type,
            size: data.size,
            content: base64
          };
        }
        else {
          throw Error();
        }
      }
      catch (error) {
        this.adjuntos.splice(index, 1);
        this.snackbar.showToast('No fue posible cargar el archivo.', 2000);
      }
      finally {
        this.actualizaMensaje = false;
      }
    } else {
      this.snackbar.showToast('Los documentos no pueden exceder los 3 MB.', 2000);
    }
  }
  async descargarAdjunto(doc: any, ev: any) {
    await this.utils.openFile(doc.name, doc.type, doc.content);
  }
  async eliminarAdjunto(doc: any, ev: any) {
    ev.stopPropagation();

    const snackbar = await this.snackbar.create('Eliminando adjunto...', false);
    const params = { messageId: this.messageId, attachmentId: doc.id };
    snackbar.present();

    this.actualizaMensaje = true;

    try {
      const response = await this.api.removeAttachment(params);
      const { data } = response;

      if (data.success) {
        this.adjuntos.forEach((item, index) => {
          if (item === doc) this.adjuntos.splice(index, 1);
        });
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

      this.snackbar.showToast('No fue posible eliminar el archivo.', 2000);
    }
    finally {
      snackbar.dismiss();
      this.actualizaMensaje = false;
    }
  }
  async enviar() {
    if (this.mensajeForm.valid) {
      this.deshabilitarEventos();

      const loading = await this.loading.create({ message: 'Enviado correo...' });
      const params = {
        messageId: this.messageId,
        destinatarios: this.correos.join(','),
        asunto: this.subject?.value || '',
        cuerpo: this.body?.value || '',
      };

      loading.present();

      try {
        await this.api.sendMessage(params);

        this.messageId = undefined;

        if (this.isReply) {
          this.presentSuccess('Correo respondido correctamente.');
          this.modalCtrl.dismiss(undefined, 'reply');
        }
        else {
          this.presentSuccess('Correo enviado correctamente.');
          this.modalCtrl.dismiss(undefined, 'send');
        }
      }
      catch (error: any) {
        if (error.status == 401) {
          this.error.handle(error);
        }
        debugger
      }
      finally {
        loading.dismiss();
        // this.api.marcarVista(this.Vista);
      }
    }
  }
  async updateMessage() {
    this.actualizaMensaje = true;

    const params = {
      messageId: this.messageId,
      destinatarios: this.correos.join(','),
      asunto: this.subject?.value || '',
      cuerpo: this.body?.value || ''
    };

    try {
      await this.api.updateMessage(params);
    }
    catch (error: any) { }
    finally {
      this.actualizaMensaje = false;
    }
  }
  async cerrar() {
    this.modalCtrl.dismiss(this.messageId, 'cancel');
  }
  presentSuccess(mensaje: string) {
    this.alertCtrl.create({
      backdropDismiss: false,
      keyboardClose: false,
      cssClass: 'success-alert',
      header: 'INACAPMail',
      message: `<div class="image"><ion-icon src = "./assets/icon/check_circle.svg"></ion-icon></div>${mensaje}`,
      buttons: [
        {
          text: 'Aceptar',
          role: 'ok'
        }
      ]
    }).then(alert => alert.present())
  }
  mostrarMiniatura(type: string) {
    return type.indexOf('image/') > -1;
  }
  resolverMiniatura(data: any) {
    return this.domSanitizer.bypassSecurityTrustUrl(data.content);
  }
  habilitarEventos() {
    this.toSubscription = this.subject?.valueChanges.pipe(
      debounceTime(3000),
      distinctUntilChanged()
    ).subscribe(() => {
      this.updateMessage();
    })!;

    this.bodySubscription = this.body?.valueChanges.pipe(
      debounceTime(3000),
      distinctUntilChanged()
    ).subscribe(() => {
      this.updateMessage();
    })!;
  }
  deshabilitarEventos() {
    this.toSubscription.unsubscribe();
    this.bodySubscription.unsubscribe();
  }
  deshabilitarAdjuntar() {
    if (!this.messageId) return true;
    if (this.adjuntos.length >= 5) return true;
    return false;
  }
  deshabilitarEnviar() {
    if (!this.messageId) return true;
    if (this.correos.length == 0) return true;
    if (this.actualizaMensaje == true) return true;
    return false;
  }
  formatearFecha(fecha: string) {
    return moment(fecha).format('ddd DD/MM/YYYY HH:mm')
  }

  get subject() { return this.mensajeForm.get('asunto'); }
  get body() { return this.mensajeForm.get('cuerpo'); }

}
