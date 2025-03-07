import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
// import { Barcode, BarcodeFormat, BarcodeScanner, LensFacing, StartScanOptions } from '@capacitor-mlkit/barcode-scanning';
import { DialogService } from '../../services/dialog.service';
import { InputCustomEvent } from '@ionic/angular';
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';

@Component({
  selector: 'app-barcode-scanning-modal',
  templateUrl: './barcode-scanning-modal.component.html',
  styleUrls: ['./barcode-scanning-modal.component.scss'],
})
export class BarcodeScanningModalComponent implements OnInit, AfterViewInit, OnDestroy {

  // @Input()
  // public formats: BarcodeFormat[] = [];
  // @Input()
  // public lensFacing: LensFacing = LensFacing.Back;

  @ViewChild('square')
  public squareElement: ElementRef<HTMLDivElement> | undefined;

  public isTorchAvailable = false;
  public minZoomRatio: number | undefined;
  public maxZoomRatio: number | undefined;

  constructor(
    private readonly dialogService: DialogService,
    private readonly ngZone: NgZone,
  ) { }

  public ngOnInit(): void {
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      this.startScan();
    }, 500);
  }

  public ngOnDestroy(): void {
    this.stopScan();
  }

  public async closeModal(barcode?: string): Promise<void> {
    this.dialogService.dismissModal({
      barcode: barcode,
    });
  }

  // public async toggleTorch(): Promise<void> {
  //   await BarcodeScanner.toggleTorch();
  // }

  private async startScan(): Promise<void> {
    // Hide everything behind the modal (see `src/theme/variables.scss`)
    document.querySelector('body')?.classList.add('barcode-scanning-active');

    const result = await BarcodeScanner.startScan({ targetedFormats: [SupportedFormat.QR_CODE] });

    if (result.hasContent) {
      console.log(result.content);
      this.closeModal(result.content)
    }
    else {
      this.closeModal(undefined)
    }

  }

  private async stopScan(): Promise<void> {
    // Show everything behind the modal again
    document.querySelector('body')?.classList.remove('barcode-scanning-active');

    try {
      await BarcodeScanner.stopScan();
    }
    catch { }
  }

}

