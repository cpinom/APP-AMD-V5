import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AppGlobal {
  public Api = environment.apiUrl;
  public Version = environment.version;
  public Environment = environment.environmentTitle;
  public IsConnected = false;
  public DeviceId!: string;
  public IsApple = false;
  public NotificationFlag = false;
}
