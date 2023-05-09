import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule as ngRouterModule } from '@angular/router';
import { CoreModule, BootstrapComponent, RouterModule } from '@c8y/ngx-components';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    RouterModule.forRoot(),
    ngRouterModule.forRoot([], { enableTracing: false, useHash: true }),
    CoreModule.forRoot()
  ],
  bootstrap: [BootstrapComponent]
})
export class AppModule {}
