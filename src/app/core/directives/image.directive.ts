import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { AnimationController, ModalController } from '@ionic/angular';
import { ImageModalComponent } from '../components/image-modal/image-modal.component';

@Directive({
  selector: '[appImage]'
})
export class ImageDirective implements OnInit {

  spinner: any;
  hasError = false;
  hasSpinner = false;
  @Input() appImage!: string;
  @Input() hideViewer!: boolean;
  @HostListener('error') onError() {
    this.renderer.setAttribute(this.el.nativeElement, 'src', this.appImage || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    this.renderer.setAttribute(this.el.nativeElement, 'class', 'error');
    this.hasError = true;
  }
  @HostListener('load') onLoad() {
    if (this.hasSpinner) {
      this.renderer.setStyle(this.spinner, 'display', 'none');
      this.renderer.setStyle(this.el.nativeElement, 'display', '');
    }
  }
  @HostListener('click', ['$event']) async onClick(event?: Event) {
    ;
    if (!this.hasError && !this.hideViewer) {
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
  }

  constructor(private el: ElementRef,
    private renderer: Renderer2,
    private modalCtrl: ModalController,
    private animationCtrl: AnimationController) { }

  ngOnInit() {
    let parent = this.renderer.parentNode(this.el.nativeElement);
    let sibling = parent.querySelector('ion-spinner');

    if (sibling) {
      this.hasSpinner = true;
      this.spinner = sibling;
      this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
    }
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

export function getRouterOutlet() {
  return document.getElementById('ion-router-outlet-content');
}