import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Ingreso, Salida } from "../auth/auth.interfaces";

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  app = new Subject();
  onLogin = new Subject<Ingreso>();
  onLogout = new Subject<Salida>();
  onPhotoUpdate = new Subject();
  onPhoneUpdate = new Subject();
  onEmailUpdate = new Subject();
  onEmailNotification = new Subject<any>();

  constructor() { }

}