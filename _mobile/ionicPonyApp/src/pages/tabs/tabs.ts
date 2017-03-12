import { Component } from '@angular/core';

import { ControlPanel } from '../controlPanel/controlPanel';
import { ContactPage } from '../contact/contact';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab2Root: any = ControlPanel;
  tab3Root: any = ContactPage;

  constructor() {

  }
}
