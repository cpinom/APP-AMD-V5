import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { ErrorService } from 'src/app/core/services/error.service';
import { AppGlobal } from '../../../../app.global';
import { Platform } from '@ionic/angular';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MensajesService } from 'src/app/core/services/curso/mensajes.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { MediaService } from 'src/app/core/services/media.service';
import { VISTAS_DOCENTE } from 'src/app/app.contants';
import { DialogService } from 'src/app/core/services/dialog.service';

@Component({
  selector: 'app-enviar-correo',
  templateUrl: './enviar-correo.page.html',
  styleUrls: ['./enviar-correo.page.scss'],
})
export class EnviarCorreoPage implements OnInit, OnDestroy {

  @ViewChild('adjuntarInput') adjuntarEl!: ElementRef;
  data: any;
  alumnos: any;
  mostrarCargando = true;
  mostrarData = false;
  marcaTodos = false;
  marcaCC = true;
  marcaDC = false;
  form: FormGroup;
  patternStr = '^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ¡!@#¿?,:;\n\r\$%\^\&*\ \)\(+=._-]+$';
  messageId!: string;
  documentos: any[] = [];
  correo: string | undefined;
  submitted = false;

  constructor(private api: MensajesService,
    private error: ErrorService,
    private global: AppGlobal,
    private pt: Platform,
    private fb: FormBuilder,
    private snackbar: SnackbarService,
    private utils: UtilsService,
    private auth: AuthService,
    private media: MediaService,
    private dialog: DialogService) {

    this.auth.getAuth().then(auth => {
      this.correo = auth.user.persTemailInacap
    });

    this.form = this.fb.group({
      asunto: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(this.patternStr)
      ])],
      mensaje: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(1000),
        Validators.pattern(this.patternStr)
      ])],
      alumnos: new FormArray([], Validators.required),
      marcaCC: [true],
      marcaDC: [false]
    });

  }
  ngOnInit() {
    Preferences.get({ key: 'Seccion' }).then((result) => {
      this.data = JSON.parse(result.value!);
      this.cargar();
    });

    this.api.marcarVista(VISTAS_DOCENTE.MENSAJES);
  }
  ngOnDestroy() {
    if (this.messageId) {
      this.api.eliminarBorrador({ messageId: this.messageId });
    }
  }
  async cargar(forceRefresh = false) {
    if (!this.messageId) {
      forceRefresh = true;
    }

    try {
      const params = { seccCcod: this.data.seccCcod, ssecNcorr: this.data.ssecNcorr };
      const response = await this.api.getPrincipal(params, forceRefresh);
      const { data } = response;

      if (data.success) {
        this.alumnos = data.alumnos;
        this.messageId = data.messageId;
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
  recargar() {
    this.mostrarCargando = true;
    this.mostrarData = false;
    this.cargar(true);
    this.form.get('asunto')?.reset('');
    this.form.get('mensaje')?.reset('');
    this.form.get('marcaCC')?.setValue(true);
    this.form.get('marcaDC')?.setValue(false);
    this.documentos = [];
  }
  async enviar(e: any) {
    this.submitted = true;

    const isValid = this.form.valid;

    if (isValid) {
      const loading = await this.dialog.showLoading({ message: 'Enviando correo...' });

      try {
        const params = Object.assign({ id: this.messageId, sedeCcod: this.data.sedeCcod }, this.form.value);
        const response = await this.api.enviarMensaje(params);
        const { data } = response;

        if (data.success) {
          this.presentSuccess('Mensaje enviado correctamente.');
          this.submitted = false;
          this.recargar();
          this.api.marcarVista(VISTAS_DOCENTE.ENVIA_MENSAJE);
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
      finally {
        await loading.dismiss();
      }
    }
    else {
      this.form.markAllAsTouched();
    }

  }
  resolverFoto(persNcorr: any) {
    return `${this.global.Api}/api/v4/avatar/${persNcorr}`;
  }
  resolverMarca(item: any, e: any) {
    e.preventDefault();

    item.selected = !item.selected;

    let count = this.alumnos.filter((item: any) => item.selected);

    this.marcaTodos = this.alumnos.length == count.length;

    this.actualizarCorreos();
  }
  marcarTodos(e: any) {
    this.alumnos.forEach((item: any) => {
      item.selected = this.marcaTodos;
    });
    this.actualizarCorreos();
  }
  actualizarCorreos() {
    let formArray: FormArray = this.form.get('alumnos') as FormArray;

    formArray.clear();

    this.alumnos.forEach((item: any) => {
      if (item.selected) {
        formArray.push(new FormControl(item.persTemailInacap));
      }
    })
  }
  // async adjuntar(input: any) {
  //   if (this.pt.is('mobileweb')) {
  //     input.click();
  //   }
  //   else {
  //     const file = await this.media.getMedia();

  //     if (file) {
  //       const params = { messageId: this.messageId };
  //       const fileSize = file?.size! / 1024 / 1024;

  //       if (fileSize <= 25) {
  //         const loading = await this.dialog.showLoading({ message: 'Cargando archivo...' });

  //         try {
  //           const respone: any = await this.api.agregarArchivo(file?.path!, file?.name!, params);
  //           const { data } = respone;
  //           console.log('<<<file>>>', file);
  //           if (data.success) {
  //             this.documentos.push({
  //               id: data.id,
  //               name: file!.name,
  //               type: data.type,
  //               size: data.size,
  //               content: file?.data
  //             });
  //           }
  //           else {
  //             throw Error();
  //           }
  //         }
  //         catch (error: any) {
  //           console.log('<<file upload error>>');
  //           console.log(error);
  //           if (error && error.status == 401) {
  //             this.error.handle(error);
  //             return;
  //           }
  //           this.snackbar.showToast('No pudimos cargar el archivo.', 3000, 'danger');
  //         }
  //         finally {
  //           loading.dismiss();
  //         }
  //       }
  //       else {
  //         this.snackbar.showToast('Los archivos no pueden exceder los 25 MB.', 2000);
  //       }
  //     }
  //   }
  // }
  // async adjuntarWeb(event: any) {
  //   if (event.target.files.length > 0) {
  //     let formData = new FormData();
  //     let file = event.target.files[0];
  //     let fileSize = file.size / 1024 / 1024;
  //     let loading = await this.loading.create({ message: 'Cargando archivo...' });

  //     if (fileSize <= 3) {
  //       formData.append('file', file);

  //       await loading.present();

  //       try {
  //         let params = { messageId: this.messageId };
  //         let result: any = await this.api.agregarArchivoWeb(formData, params);

  //         if (result.success) {
  //           let base64 = await this.utils.convertBlobToBase64(file);

  //           this.documentos.push({
  //             id: result.id,
  //             name: file.name,
  //             type: file.type,
  //             data: base64
  //           });
  //         }
  //         else {
  //           throw Error();
  //         }
  //       }
  //       catch (error) { }
  //       finally {
  //         await loading.dismiss();
  //       }

  //     } else {
  //       this.snackbar.showToast('El archivo no pueden exceder los 3 MB.', 2000);
  //     }
  //   }
  // }
  async adjuntar(input: any) {
    if (this.pt.is('mobileweb')) {
      input.click();
    }
    else {
      const media = await this.media.getMedia();

      if (media) {
        const fileSize = media?.size! / 1024 / 1024;
        const base64String = media.data;

        if (fileSize >= 25) {
          this.presentError('Cargar Archivos', 'Los documentos no pueden exceder los 25 MB.');
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

        /*if (fileSize <= 150) {
          const loading = await this.dialog.showLoading({ message: 'Cargando archivo...' });

          try {
            const respone: any = await this.api.agregarArchivo(file?.path!, file?.name!, params);
            const { data } = respone;
            console.log('<<<file>>>', file);
            if (data.success) {
              this.documentos.push({
                id: data.id,
                name: file!.name,
                type: data.type,
                size: data.size,
                content: file?.data
              });
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
        }*/
      }
    }
  }
  async adjuntarWeb(event: any) {
    if (event.target.files.length > 0) {
      let file = event.target.files[0];
      let fileSize = file.size / 1024 / 1024;

      if (fileSize >= 25) {
        await this.presentError('Cargar Archivos', 'Los documentos no pueden exceder los 25 MB.');
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

        const response = await this.api.agregarArchivoV5(this.messageId, params);
        const result = response.data;

        if (result.success) {
          if (result.code == 202) {
            const progreso = Math.round(result.progress);
            loading.message = `(${progreso}%) procesando....`;
          }
          else if (result.code == 200) {
            this.documentos.push({
              id: result.data.id,
              name: fileName,
              type: result.data.type,
              size: result.data.size,
              content: base64String
            });

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
  async verDocumento(doc: any) {
    await this.utils.openFile(doc.name, doc.type, doc.data);
  }
  async presentSuccess(mensaje: string) {
    const alert = await this.dialog.showAlert({
      backdropDismiss: false,
      keyboardClose: false,
      cssClass: 'success-alert',
      header: 'Comunicaciones',
      message: `<div class="image"><ion-icon src = "./assets/icon/check_circle.svg"></ion-icon></div>${mensaje}`,
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
  get asuntoError() {
    if (this.asunto?.hasError('required')) return 'Campo es obligatorio.';
    if (this.asunto?.hasError('maxlength')) return 'Máximo 50 caracteres permitidos.';
    if (this.asunto?.hasError('pattern')) return 'Sólo puede ingresar caracteres alfanuméricos.';
    return '';
  }
  get mensajeError() {
    if (this.mensaje?.hasError('required')) return 'Campo es obligatorio.';
    if (this.mensaje?.hasError('maxlength')) return 'Máximo 100 caracteres permitidos.';
    if (this.mensaje?.hasError('pattern')) return 'Sólo puede ingresar caracteres alfanuméricos.';
    return '';
  }
  get asunto() { return this.form.get('asunto') }
  get mensaje() { return this.form.get('mensaje') }

}
