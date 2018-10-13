import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment'
import { Observable, of } from 'rxjs';
import { catchError, map, tap, mergeMap, concatMap } from 'rxjs/operators';
import { Script } from './script';

export class ValidationResult {
  ast: ASTNode[];
  error: ParseError;

  // Information
  functionCalls: Information<ASTToken>[];
  functionDefinitions: ASTNode[];
  variables: ASTToken[];
}

export class ASTNode {
  token: ASTToken;
  type: string;
  args: ASTNode[];
  children: ASTNode[];
}

export class ASTToken {
  type: string;
  value: string;
  lineNum: number;
  linePos: number;
}

export class ParseError {
  message: string;
  linePos: number;
  lineNum: number;
}

export class Information<T> {
  name: string;
  items: T[];

  constructor(name: string) {
    this.name = name;
    this.items = [];
  }
}

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor(private http: HttpClient,
    private messageService: MessageService) { }

  validate(script: Script): Observable<ValidationResult> {
    return this.compile(script)
      .pipe(
        map(res => this.generateInformation(res))
      );
  }

  compile(script: Script): Observable<ValidationResult> {
    const url = `${environment.baseURL}robotScripts/compile`;
    this.log(`Compiling script ${script.name}`);
    return this.http.post(url, {
      script: script.script
    })
      .pipe(
        tap(_ => this.log(`Compiled script ${script.name}`)),
        catchError(this.handleError<Script>(`validate id=${script.id}`)),
        map<any, ValidationResult>(res => {
          var val = new ValidationResult();
          val.ast = res.ast;
          if (res.error) val.error = res.error;
          return val;
        })
      );
  }

  generateInformation(result: ValidationResult): ValidationResult {
    result.functionCalls = [];
    result.functionDefinitions = [];
    result.variables = [];
    var functions = [];
    if (result.ast) result.ast.forEach(node => this.informationWalk(node, result, functions));

    var functionMap: { [index: string] : Information<ASTToken>} = {};
    functions.forEach(func => {
      var current = functionMap[func.value];
      if (!current) {
        current = new Information<ASTToken>(func.value);
        functionMap[func.value] = current;
      }
      current.items.push(func);
    });

    for (var prop in functionMap) {
      if (functionMap.hasOwnProperty(prop)) {
        result.functionCalls.push(functionMap[prop]);
      }
    }

    result.functionCalls.sort((a, b) => a.name == b.name ? 0 : (a.name > b.name ? 1 : -1));

    return result;
  }

  private informationWalk(node: ASTNode, result: ValidationResult, functions: ASTToken[]): void {
    if (node.type == 'Function') functions.push(node.token);
    if (node.children) node.children.forEach(child => this.informationWalk(child, result, functions));
  }

  private log(message: string) {
    this.messageService.add(`ValidationService: ${message}`);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
