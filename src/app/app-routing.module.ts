import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Lesson1Component } from './pages/lesson1/lesson1.component';
import { Lesson2Component } from './pages/lesson2/lesson2.component';
import { Lesson3Component } from './pages/lesson3/lesson3.component';
import { Lesson4Component } from './pages/lesson4/lesson4.component';

const routes: Routes = [
  { path: '', redirectTo: 'lesson1', pathMatch: 'full' },
  { path: 'lesson1', component: Lesson1Component },
  { path: 'lesson2', component: Lesson2Component },
  { path: 'lesson3', component: Lesson3Component },
  { path: 'lesson4', component: Lesson4Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
