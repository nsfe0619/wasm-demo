import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Lesson1Component } from './pages/lesson1/lesson1.component';
import { Lesson2Component } from './pages/lesson2/lesson2.component';

const routes: Routes = [
  { path: '', redirectTo: 'lesson1', pathMatch: 'full' },
  { path: 'lesson1', component: Lesson1Component },
  { path: 'lesson2', component: Lesson2Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
