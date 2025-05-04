import { Route } from '@angular/router';
import { HelloComponent } from './hello/hello.component';
import { GoodbyeComponent } from './goodbye/goodbye.component';
import { RootComponent } from './root/root.component';

export const appRoutes: Route[] = [
  { path: 'hello', component: HelloComponent },
  { path: 'goodbye', component: GoodbyeComponent },
  { path: '', component: RootComponent },
];
