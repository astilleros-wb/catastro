import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CatastroModule } from './catastro/catastro.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    CatastroModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
