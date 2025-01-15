import { Component, OnInit } from '@angular/core';
import { EventsService } from 'src/app/core/services/events.services';

@Component({
  selector: 'app-publico',
  templateUrl: './publico.page.html',
  styleUrls: ['./publico.page.scss'],
})
export class PublicoPage implements OnInit {

  constructor(private events: EventsService) { }

  ngOnInit() {
  }
  checkTap(ev: any, index: number) {
    this.events.app.next({ action: 'scrollTop', index: index, ev: ev });
  }

}
