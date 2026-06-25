import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password';
import { TasksComponent } from './components/tasks/tasks';


export const routes: Routes = [
    // Головна сторінка
    { path: '', redirectTo: '/tasks', pathMatch: 'full'},
    
    { path: 'tasks', component: TasksComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    
    // Якщо користувач введе неіснуючу адресу
    { path: '**', redirectTo: '/tasks' } 
];
