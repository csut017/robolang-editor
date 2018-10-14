import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment'
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Script } from './script';
import { ScriptHelpService, HelpInfo, FunctionArgument, FunctionChild } from './script-help.service';

export class ValidationResult {
  ast: ASTNode[];
  error: ParseError;

  // Information
  functionCalls: Information<ASTToken>[];
  functionDefinitions: ASTToken[];
  references: Information<ASTToken>[];

  // Validation
  issues: ParseError[];
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

  static FromToken(msg: string, token: ASTToken): ParseError {
    var err = new ParseError();
    err.message = msg;
    err.lineNum = token.lineNum;
    err.linePos = token.linePos;
    return err;
  }
}

export class Information<T> {
  name: string;
  items: T[];

  constructor(name: string) {
    this.name = name;
    this.items = [];
  }
}

// This is copied from script-help.service - not sure how to import it
const ChildNumber = {
  One: '1' as '1',
  OneOrZero: '0..1' as '0..1',
  OneOrMore: '1..*' as '1..*',
  ZeroOrMore: '0..*' as '0..*',
}
type ChildNumber = (typeof ChildNumber)[keyof typeof ChildNumber];

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor(private http: HttpClient,
    private messageService: MessageService,
    private scriptHelp: ScriptHelpService) {
    const help = this.scriptHelp.getAll();
    help.forEach(item => this.helpMap[item.title] = item);
  }

  private helpMap: { [index: string]: HelpInfo } = {};

  validate(script: Script): Observable<ValidationResult> {
    return this.compile(script)
      .pipe(
        map(res => this.checkAST(this.generateInformation(res)))
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

  checkAST(result: ValidationResult): ValidationResult {
    result.issues = [];
    result.ast.forEach(node => this.checkASTNode(result, node));
    return result;
  }

  private checkASTNode(result: ValidationResult, node: ASTNode, parent?: ASTNode) {
    if (node.type == 'Function') {
      this.checkASTFunctionNode(result, node, parent);
      (node.children || []).forEach(child => this.checkASTNode(result, child, node));
    }
  }

  private checkASTFunctionNode(result: ValidationResult, node: ASTNode, parent: ASTNode) {
    const funcName = node.token.value;
    const item = this.helpMap[funcName];
    if (!item) {
      if ((result.functionDefinitions || []).find(func => func.value == funcName)) {
        // Don't do any validations on custom functions (yet) - we don't know what arguments they expect
        return;
      }
      result.issues.push(ParseError.FromToken(`Unknown function '${funcName}'`, node.token));
      return;
    }

    var argMap: { [index: string]: number } = {};
    (node.args || []).forEach(arg => argMap[arg.token.value] = (argMap[arg.token.value] || 0) + 1);
    var argKeys: string[] = [];
    for (var prop in argMap) {
      if (argMap.hasOwnProperty(prop)) {
        argKeys.push(prop);
      }
    }
    argKeys.forEach(key => {
      const count = argMap[key];
      if (count > 1) {
        result.issues.push(ParseError.FromToken(`Duplicate argument '${key}' found for '${funcName}'`, node.token));
      }
    });

    var checked = (item.arguments || []).map(arg => this.checkASTNodeArg(result, node, funcName, arg));
    checked.forEach(arg => argMap[arg] = 0);
    argKeys.forEach(key => {
      const count = argMap[key];
      if (count > 0) {
        result.issues.push(ParseError.FromToken(`Unknown argument '${key}' found for '${funcName}'`, node.token));
      }
    });

    if (item.hasParents) {
      var isValid = !!parent;
      if (isValid) {
        const parentName = parent.token.value;
        isValid = !!item.parents.find(p => p == parentName);
      }

      if (!isValid) {
        const parentNames = item.parents.map(p => `'${p}'`).join(' or ');
        result.issues.push(ParseError.FromToken(`'${funcName}' must be a child of ${parentNames}`, node.token));
      }
    }

    if (item.hasChildren) {
      const fixed = item.children.filter(child => this.checkASTNodeChild(result, node, funcName, child)).length == 0;
      if (item.requireChildren && !(node.children && node.children.length)) {
        result.issues.push(ParseError.FromToken(`'${funcName}' requires at least one child`, node.token));
      }
      if (fixed) {
        node.children.forEach(c => {
          const childName = c.token.value;
          if (!item.children.find(ic => ic.name == childName)) {
            result.issues.push(ParseError.FromToken(`Unexpected '${childName}' in ${funcName}'`, node.token));
          }
        });
      }
    } else {
      if (node.children && node.children.length) {
        result.issues.push(ParseError.FromToken(`'${funcName}' does not allow children`, node.token));
      }
    }
  }

  private checkASTNodeChild(result: ValidationResult, node: ASTNode, funcName: string, child: FunctionChild): boolean {
    const childName = child.name == '*' ? 'child' : `'${child.name}' child`;
    var children = node.children || [];
    if (child.name != '*') children = children.filter(c => c.token.value == child.name);
    const childCount = children.length;
    switch (child.number) {
      case ChildNumber.One:
        if (childCount != 1) {
          result.issues.push(ParseError.FromToken(`'${funcName}' expects one and only one ${childName}`, node.token));
        }
        break;

      case ChildNumber.OneOrZero:
        if (childCount > 1) {
          result.issues.push(ParseError.FromToken(`'${funcName}' expects only one ${childName}`, node.token));
        }
        break;

      case ChildNumber.OneOrMore:
        if (childCount < 1) {
          result.issues.push(ParseError.FromToken(`'${funcName}' expects at least one ${childName}`, node.token));
        }
        break;
    }
    return child.name == '*';
  }

  private checkASTNodeArg(result: ValidationResult, node: ASTNode, funcName: string, arg: FunctionArgument): string {
    const existing = (node.args || []).find(n => n.token.value == arg.name);
    if (arg.isRequired) {
      if (!existing) {
        result.issues.push(ParseError.FromToken(`Missing required argument '${arg.name}' for '${funcName}'`, node.token));
        return;
      }
    }

    return arg.name;
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
        info.items.sort((a, b) => a.lineNum == b.lineNum ? 0 : (a.lineNum > b.lineNum ? 1 : -1));
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
