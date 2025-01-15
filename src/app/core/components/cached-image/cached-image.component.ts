import { Component, Input } from '@angular/core';
import { CapacitorHttp } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { ImageModalComponent } from '../image-modal/image-modal.component';
import { AnimationController, ModalController } from '@ionic/angular';

const CACHE_FOLDER = 'CACHED-IMG';

@Component({
  selector: 'app-cached-image',
  templateUrl: './cached-image.component.html',
  styleUrls: ['./cached-image.component.scss'],
})
export class CachedImageComponent {

  _src!: string;

  constructor(private modalCtrl: ModalController,
    private animationCtrl: AnimationController) { }

  @Input() spinner = false;

  @Input()
  set src(imageUrl: string) {
    const imageName = imageUrl.split('/').pop();

    Filesystem.readFile({
      directory: Directory.Cache,
      path: `${CACHE_FOLDER}/${imageName}`
    }).then(readFile => {
      this._src = `data:image/png;base64,${readFile.data}`;
    }).catch(async e => {
      await this.storeImage(imageUrl, imageName!);

      Filesystem.readFile({
        directory: Directory.Cache,
        path: `${CACHE_FOLDER}/${imageName}`
      }).then(readFile => {
        this._src = `data:image/png;base64,${readFile.data}`;
      });
    })

  }
  async storeImage(url: string, path: string) {
    const response = await CapacitorHttp.get({ url, responseType: 'blob' });
    const base64Data = response.data;
    // const response: any = await fetch(url);
    // const blob = await response.blob();
    // const base64Data = await this.convertBlobToBase64(blob) as string;

    const savedFile = await Filesystem.writeFile({
      path: `${CACHE_FOLDER}/${path}`,
      data: base64Data,
      directory: Directory.Cache
    });

    return savedFile;
  }
  async onClick(ev: Event) {
    ev?.stopPropagation();

    // const srcText: string = this.el.nativeElement.src;
    // const descText: string = this.el.nativeElement.alt || '';
    const modal = await this.modalCtrl.create({
      component: ImageModalComponent,
      componentProps: {
        src: this._src
      },
      cssClass: 'transparent-modal',
      showBackdrop: true,
      keyboardClose: true,
      enterAnimation: this.enterAnimation
    });

    return await modal.present();
  }

  enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root?.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root?.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' },
      ]);

    return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(250)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

}
