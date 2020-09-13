import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MenuService } from 'src/app/_service/menu.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  usuario: string;
  rol: string;
  constructor(private jwt: JwtHelperService, private menuService:MenuService) {}

  ngOnInit(): void {
    let token = sessionStorage.getItem('access_token');
    if (token != null) {
      var jsonTok = this.jwt.decodeToken(token);
      this.usuario = jsonTok.user_name;
      this.rol = jsonTok.authorities[0];
      this.menuService
        .listarPorUsuario(this.usuario)
        .subscribe((data) => {
          this.menuService.setMenuCambio(data);
        });
    }
  }
}
