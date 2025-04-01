import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './components/menu/menu.component';
import { FormsModule } from '@angular/forms';
import { Lesson1Component } from './pages/lesson1/lesson1.component';
import { Lesson2Component } from './pages/lesson2/lesson2.component';
import { Lesson3Component } from './pages/lesson3/lesson3.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    Lesson1Component,
    Lesson2Component,
    Lesson3Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
