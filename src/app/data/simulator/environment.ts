import { RobotSimulator, ResolvedArguments } from "../robot-simulator";
import { ASTNode, ASTToken } from "src/app/services/validation.service";
import { FunctionExecution, DefineFunction, StartFunction } from "./functions";

export class ExecutionEnvironment {
    functions: FunctionDefinition[] = [];
    coreFunctions: { [index: string]: FunctionExecution } = {};
    simulator: RobotSimulator;
    script: InternalScript;

    constructor(script: InternalScript, simulator: RobotSimulator) {
        this.script = script;
        this.simulator = simulator;
        this.coreFunctions['function'] = new DefineFunction(this);
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

            default:
                throw `Unknown contant type ${tok.type}`;
        }
    }
}

class FunctionDefinition {
    name: string;
    nodes: ASTNode[];
    location: ASTToken;
}
