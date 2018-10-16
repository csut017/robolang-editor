import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  errorMessage: string = '';
  username: string = '';
  password: string = '';
  return: string = '';

  constructor(private authenticationService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams
      .subscribe(params => this.return = params['return'] || '/scripts');
  }

  login() {
    if (this.username && this.password) {
      this.authenticationService.login(this.username, this.password)
        .subscribe(data => {
          if (data.status === 'Ok') {
            this.errorMessage = '';
            this.router.navigateByUrl(this.return);
          } else {
            this.errorMessage = data.msg;
          }
        });
    }
  }
}
