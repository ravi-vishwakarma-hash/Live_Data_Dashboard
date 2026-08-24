import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'dashboard'
	},
	{
		path: 'dashboard',
		loadComponent: () =>
			import('./components/dashbord/dashbord').then(component => component.Dashboard)
	},
	{
		path: '**',
		redirectTo: 'dashboard'
	}
];
