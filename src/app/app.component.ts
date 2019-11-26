import { Component, HostBinding } from '@angular/core';
import * as Color from 'color';

@Component({
  selector: 'body',
  templateUrl: './app.component.html'
})
export class AppComponent {
  @HostBinding('style.background-color') currentColour: Color.Color = Color('hsl(0, 40%, 20%)');


  constructor() {

  }

}
