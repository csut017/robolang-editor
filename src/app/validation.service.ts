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
  functionDefinitions: ASTToken[];
  references: Information<ASTToken>[];
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
    result.references = [];
    var functions = [];
    var references = [];
    (result.ast || []).forEach(node => this.informationWalk(node, result, functions, references));

    result.functionCalls = this.consolidateInformation(functions);
    result.functionDefinitions.sort((a, b) => a.value == b.value ? 0 : (a.value > b.value ? 1 : -1))
    result.references = this.consolidateInformation(references);

    return result;
  }

  private consolidateInformation(tokens: ASTToken[]): Information<ASTToken>[] {
    var output = [];
    var outputMap: { [index: string]: Information<ASTToken> } = {};
    tokens.forEach(func => {
      var current = outputMap[func.value];
      if (!current) {
        current = new Information<ASTToken>(func.value);
        outputMap[func.value] = current;
      }
      current.items.push(func);
    });

    for (var prop in outputMap) {
      if (outputMap.hasOwnProperty(prop)) {
        var info = outputMap[prop];
        info.items.sort((a, b) => a.lineNum == b.lineNum ? 0 :(a.lineNum > b.lineNum ? 1 : -1));
        output.push(info);
      }
    }

    output.sort((a, b) => a.name == b.name ? 0 : (a.name > b.name ? 1 : -1));
    return output;
  }

  private addNamedToken(node: ASTNode, output: ASTToken[]) {
    var tok = new ASTToken();
    const nameToken = this.findArg(node, 'name');
    if (nameToken) {
      tok.value = nameToken.value;
      tok.lineNum = node.token.lineNum;
      tok.linePos = node.token.linePos;
      output.push(tok);
    }
  }

  private informationWalk(node: ASTNode, result: ValidationResult, functions: ASTToken[], references: ASTToken[]): void {
    if (node.type == 'Function') {
      functions.push(node.token);
      if (node.token.value == 'function') {
        this.addNamedToken(node, result.functionDefinitions);
      }
    } else if (node.type == 'Reference') {
      references.push(node.token);
    }

    (node.children || []).forEach(child => this.informationWalk(child, result, functions, references));
    (node.args || []).forEach(arg => (arg.children || []).forEach(child => this.informationWalk(child, result, functions, references)))
  }

  private findArg(node: ASTNode, name: string): ASTToken {
    var argNode = (node.args || []).find(arg => arg.token.value == name);
    if (argNode && argNode.children && argNode.children.length) {
      return argNode.children[0].token;
    }

    return;
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
