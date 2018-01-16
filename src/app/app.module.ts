import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';


import { AppComponent } from './app.component';
import { SearchComponent } from './search/search.component';
import { ResultComponent } from './result/result.component';
import { WaitComponent } from './wait/wait.component';
import { DataService } from './data.service';


@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    ResultComponent,
    WaitComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
	providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
