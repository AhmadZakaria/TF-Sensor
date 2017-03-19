import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { ControlPanel } from '../pages/controlPanel/controlPanel';
import { ContactPage } from '../pages/contact/contact.page';
import { TabsPage } from '../pages/tabs/tabs.page';

@NgModule({
  declarations: [
    MyApp,
    ControlPanel,
    ContactPage,
    TabsPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ControlPanel,
    ContactPage,
    TabsPage
  ],
  providers: [{ provide: ErrorHandler, useClass: IonicErrorHandler }]
})
export class AppModule { }
