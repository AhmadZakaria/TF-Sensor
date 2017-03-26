import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { ContactPage } from '../pages/contact/contact.page';
import { ControlPanel } from '../pages/controlPanel/controlPanel.page';
import { TabsPage } from '../pages/tabs/tabs.page';

@NgModule({
    declarations: [
        MyApp,
        ContactPage,
        ControlPanel,
        TabsPage,
    ],
    imports: [
        IonicModule.forRoot(MyApp),
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        ContactPage,
        ControlPanel,
        TabsPage,
    ],
    providers: [],
})
export class AppModule { }
