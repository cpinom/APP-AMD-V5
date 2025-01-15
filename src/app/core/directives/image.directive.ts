import { Directive, ElementRef, HostListener } from '@angular/core';
import { AnimationController, ModalController } from '@ionic/angular';
import { ImageModalComponent } from '../components/image-modal/image-modal.component';

@Directive({
  selector: '[appImage]'
})
export class ImageDirective {

  constructor(private el: ElementRef,
    private modalCtrl: ModalController,
    private animationCtrl: AnimationController) { }

  @HostListener('click', ['$event']) async onClick(event?: Event) {
    event?.stopPropagation();

    const srcText: string = this.el.nativeElement.src;
    const descText: string = this.el.nativeElement.alt || '';
    const modal = await this.modalCtrl.create({
      component: ImageModalComponent,
      componentProps: {
        src: srcText,
        title: descText,
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
