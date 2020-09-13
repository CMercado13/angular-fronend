import { Signos } from './../../../_model/signos';
import { Paciente } from './../../../_model/paciente';
import { SignosService } from './../../../_service/signos.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PacienteService } from './../../../_service/paciente.service';
import { Observable, EMPTY } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'app-nuevo',
  templateUrl: './nuevo.component.html',
  styleUrls: ['./nuevo.component.css'],
})
export class NuevoComponent implements OnInit {
  form: FormGroup;
  formPac: FormGroup;
  id: number;
  edicion: boolean;
  pacientes: Paciente[] = [];
  pacientesFiltrados: Observable<Paciente[]>;
  myControlPaciente: FormControl = new FormControl();
  fechaSeleccionada: Date = new Date();
  maxFecha: Date = new Date();
  pacienteSeleccionado: Paciente;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signosService: SignosService,
    private pacienteService: PacienteService
  ) {
    this.form = new FormGroup({
      id: new FormControl(0),
      fecha: new FormControl('', [Validators.required]),
      paciente: this.myControlPaciente,
      temperatura: new FormControl(''),
      pulso: new FormControl(''),
      ritmo: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((data: Params) => {
      this.id = data['id'];
      this.edicion = this.id != null;
      console.log(this.edicion);
      this.initForm();
    });

    this.listarPacientes();

    this.pacientesFiltrados = this.myControlPaciente.valueChanges.pipe(
      map((val) => this.filtrarPacientes(val))
    );
  }

  initForm() {
    if (this.edicion) {
      this.signosService.listarPorId(this.id).subscribe((data) => {
        this.myControlPaciente.setValue(data.paciente);
        this.form = new FormGroup({
          id: new FormControl(data.idSigno),
          paciente: this.myControlPaciente,
          temperatura: new FormControl(data.temperatura),
          pulso: new FormControl(data.pulso),
          fecha: new FormControl(data.fecha),
          ritmo: new FormControl(data.ritmoRespiratorio),
        });
      });
    }
  }

  listarPacientes() {
    this.pacienteService.listar().subscribe((data) => {
      this.pacientes = data;
    });
  }

  seleccionarPaciente(e: any) {
    this.pacienteSeleccionado = e.option.value;
  }

  mostrarPaciente(val: Paciente) {
    return val ? `${val.nombres} ${val.apellidos}` : val;
  }

  filtrarPacientes(val: any) {
    if (val != null && val.idPaciente > 0) {
      return this.pacientes.filter(
        (el) =>
          el.nombres.toLowerCase().includes(val.nombres.toLowerCase()) ||
          el.apellidos.toLowerCase().includes(val.apellidos.toLowerCase()) ||
          el.dni.includes(val.dni)
      );
    }
    return this.pacientes.filter(
      (el) =>
        el.nombres.toLowerCase().includes(val?.toLowerCase()) ||
        el.apellidos.toLowerCase().includes(val?.toLowerCase()) ||
        el.dni.includes(val)
    );
  }

  operar() {
    if (this.form.invalid) {
      return;
    }

    let signo = new Signos();
    signo.idSigno = this.form.value['id'];
    signo.fecha = this.form.value['fecha'];
    signo.pulso = this.form.value['pulso'];
    signo.ritmoRespiratorio = this.form.value['ritmo'];
    signo.temperatura = this.form.value['temperatura'];
    signo.paciente = this.pacienteSeleccionado;

    if (this.edicion) {
      //MODIFICAR
      this.signosService.modificar(signo).subscribe(() => {
        this.signosService.listar().subscribe((data) => {
          this.signosService.signosCambio.next(data);
          this.signosService.mensajeCambio.next('SE MODIFICO');
        });
      });
    } else {
      //INSERTAR
      this.signosService.registrar(signo).subscribe(() => {
        this.signosService.listar().subscribe((data) => {
          this.signosService.signosCambio.next(data);
          this.signosService.mensajeCambio.next('SE REGISTRO');
        });
      });
    }
    this.router.navigate(['signos']);
  }
}
