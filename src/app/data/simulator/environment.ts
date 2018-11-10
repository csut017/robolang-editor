import { InternalScript, } from "../robot-simulator";
import { ASTNode, ASTToken } from "src/app/services/validation.service";
import { FunctionExecution, DefineFunction, StartFunction, DefineOrSetVariable, SaySpeech, PlaySound, ShowScreen } from "./functions";
import { MessageLog } from "./message-log";
import { VariableTable } from "./variable-table";

export class ExecutionEnvironment {
    functions: FunctionDefinition[] = [];
    coreFunctions: { [index: string]: FunctionExecution } = {};
    log: MessageLog;
    script: InternalScript;
    variables: VariableTable;

    constructor(script: InternalScript, log: MessageLog, parent: ExecutionEnvironment) {
        this.script = script;
        this.log = log;
        this.variables = new VariableTable(parent ? parent.variables : null);
        this.coreFunctions['function'] = new DefineFunction(this);
        this.coreFunctions['play'] = new PlaySound(this);
        this.coreFunctions['say'] = new SaySpeech(this);
        this.coreFunctions['showScreen'] = new ShowScreen(this);
        this.coreFunctions['variable'] = new DefineOrSetVariable(this);
    }

    addFunction(name: string, node: ASTNode): void {
        let func = new FunctionDefinition();
        func.name = name;
        func.nodes = node.children;
        func.location = node.token;
        this.functions.push(func);
    }

    findFunction(name: string): FunctionExecution {
        let defined = this.functions.find(f => f.name == name);
        if (defined) return new StartFunction(this, defined.nodes);

        let core = this.coreFunctions[name];
        if (core) return core;
        throw `Unknown function '${name}'`;
    }

    resolveArguments(node: ASTNode): ResolvedArguments {
        let args = {};
        (node.args || []).forEach(arg => {
            let name = arg.token.value,
                value = this.resolveNode(arg.children[0]);
            args[name] = value;
        })
        return args;
    }

    resolveNode(node: ASTNode): any {
        switch (node.type) {
            case 'Constant':
                return this.resolveConstant(node.token);

            default:
                throw `Unknown node ${node.type}`;
        }
    }

    resolveConstant(tok: ASTToken): any {
        switch (tok.type) {
            case 'TEXT':
                return tok.value;

            case 'NUMBER':
                if (tok.value.indexOf('.') >= 0) {
                    return parseFloat(tok.value);
                }
                return parseInt(tok.value);

            case 'KEYWORD':
                switch (tok.value) {
                    case 'TRUE':
                        return true;

                    case 'FALSE':
                        return true;

                    default:
                        throw `Unknown constant keyword ${tok.type}`;
                }

            default:
                throw `Unknown constant type ${tok.type}`;
        }
    }
}

export type ResolvedArguments = { [index: string]: any };

class FunctionDefinition {
    name: string;
    nodes: ASTNode[];
    location: ASTToken;
}
