import { InternalScript, ScriptManager, } from "../robot-simulator";
import { ASTNode, ASTToken } from "src/app/services/validation.service";
import { FunctionExecution, DefineFunction, StartFunction, DefineOrSetVariable, SaySpeech, PlaySound, ShowScreen, EnterWait, StartScript } from "./functions";
import { MessageLog } from "./message-log";
import { VariableTable } from "./variable-table";
import { RobotResource } from "../robot-resource";
import * as moment from 'moment';
import { WaitState } from "./wait-state";

export class ExecutionEnvironment {
    functions: FunctionDefinition[] = [];
    coreFunctions: { [index: string]: FunctionExecution } = {};
    log: MessageLog;
    script: InternalScript;
    variables: VariableTable;
    waitState: WaitState;
    state: string;

    constructor(script: InternalScript, log: MessageLog, parent: ExecutionEnvironment, scriptManager: ScriptManager) {
        this.script = script;
        this.log = log;
        this.variables = new VariableTable(parent ? parent.variables : null);
        this.coreFunctions['call'] = new StartScript(this, scriptManager);
        this.coreFunctions['function'] = new DefineFunction(this);
        this.coreFunctions['play'] = new PlaySound(this);
        this.coreFunctions['say'] = new SaySpeech(this);
        this.coreFunctions['showScreen'] = new ShowScreen(this);
        this.coreFunctions['variable'] = new DefineOrSetVariable(this);
        this.coreFunctions['wait'] = new EnterWait(this);
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

    findResource(name: string, parentType?: string): RobotResource {
        const res = parentType 
            ? this.script.resources.find(r => r.name == name && r.type == parentType)
            : this.script.resources.find(r => r.name == name);
        return res;
    }

    resolveArguments(node: ASTNode): ResolvedArguments {
        let args = {};
        (node.args || []).forEach(arg => {
            let name = arg.token.value,
                value = this.resolveNode(arg.children[0], name);
            args[name] = value;
        })
        return args;
    }

    resolveNode(node: ASTNode, parentType: string): any {
        switch (node.type) {
            case 'Constant':
                return this.resolveConstant(node.token);

            case 'Reference':
                return this.resolveReference(node.token.value, parentType);

            default:
                throw `Unknown node ${node.type}`;
        }
    }

    resolveReference(name: string, parentType: string): any {
        const variable = this.variables.get(name);
        if (variable) return variable.value;

        const res = this.findResource(name, parentType);
        if (res) {
            this.log.addMessage(`Resolving tags in "${res.resource}"`);
            return res.resource;
        }

        throw `Unknown reference ${name}`;
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

            case 'DURATION':
                return new Duration().parse(tok.value);

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

export class Duration {
    private seconds: number = 0;

    toString(): string {
        return `${this.seconds}s`;
    }

    addSeconds(amount: number): Duration {
        this.seconds += amount;
        return this;
    }

    addMinutes(amount: number): Duration {
        this.seconds += (amount * 60);
        return this;
    }

    addHours(amount: number): Duration {
        this.seconds += (amount * 3600);
        return this;
    }

    addDays(amount: number): Duration {
        this.seconds += (amount * 86400);
        return this;
    }

    parse(input: string, start: number = 0): Duration {
        this.seconds = start;
        let num = '';
        for (let c of input) {
            if (c >= '0' && c <= '9') {
                num += c;
            } else {
                if (num) {
                    let val = parseInt(num);
                    num = '';
                    switch (c) {
                        case 's':
                            this.seconds += val;
                            break;

                        case 'm':
                            this.seconds += (val * 60);
                            break;

                        case 'h':
                            this.seconds += (val * 3600);
                            break;

                        case 'd':
                            this.seconds += (val * 86400);
                            break;
                    }
                } else {
                    throw `Invalid duration '${input}'`;
                }
            }
        }

        return this;
    }

    toTime(): moment.Moment {
        return moment().add(this.seconds, 's');
    }
}
