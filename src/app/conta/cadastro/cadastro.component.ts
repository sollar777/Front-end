import { AfterViewInit, Component, ElementRef, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormControlName, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'ngx-custom-validators';
import { fromEvent, merge, Observable } from 'rxjs';
import { DisplayMessage, GenericValidator, ValidationMessages } from 'src/app/utils/generic-form-validations';
import { Usuario } from '../models/usuario';
import { ContaService } from '../services/conta.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html'
})
export class CadastroComponent implements OnInit, AfterViewInit {

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements!: ElementRef[];

  errors: any[] = [];
  cadastroForm!: FormGroup;
  usuario!: Usuario;

  validationMessages!: ValidationMessages;
  genericValidation!: GenericValidator;
  displayMessage: DisplayMessage = {};

  constructor(private fb: FormBuilder, private contaService: ContaService) { 

    this.validationMessages = {
      email: {
        required: 'Informe seu e-mail',
        email: 'Email inválido'
      },
      password: {
        required: 'Informe a senha',
        rangeLength: 'A senha deve possuir entre 6 e 15 caracteres'
      },
      confirmPassword: {
        required: 'Informe a senha novamente',
        rangeLength: 'A senha deve possuir entre 6 e 15 caracteres',
        equalTo: 'As senhas não conferem'
      }
    };

    this.genericValidation = new GenericValidator(this.validationMessages);
  }

  ngOnInit(): void {

    let senha = new FormControl('', [Validators.required, CustomValidators.rangeLength([6, 15])]);
    let senhaConfirm = new FormControl('', [Validators.required, CustomValidators.rangeLength([6, 15]), CustomValidators.equalTo(senha)]);

    this.cadastroForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: senha,
      confirmPassword: senhaConfirm
    });
  }

  ngAfterViewInit(): void {

    /* verificando os campos que deixam de ter foco para passar para a variavel controlBlurs */
    let controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));

      /* adiciona na variavel displayMessage os campo que perderam foco e diz se esta invalido ou nao com a funcao genericValidation()*/
      merge(...controlBlurs).subscribe(() => {
        this.displayMessage = this.genericValidation.processarMensagens(this.cadastroForm);
      });

  }

  adicionarConta(){
    /** Verifica se o formGroup que é o form esta sujo e se esta valido para passar os valores dos campos para a variavel usuario para realziar o cadastro*/
    if (this.cadastroForm.dirty && this.cadastroForm.valid){
      this.usuario = Object.assign({}, this.usuario, this.cadastroForm.value);

      this.contaService.registrarUsuario(this.usuario);
    }
  }

}
