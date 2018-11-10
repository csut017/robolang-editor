import { ExecutionEnvironment } from "./environment";
import { ASTNode } from "src/app/services/validation.service";
import { ResolvedArguments, LogCategory } from "../robot-simulator";

export interface FunctionExecution {
    execute(ResolvedArguments, ASTNode);
}

export class DefineFunction implements FunctionExecution {

    constructor(private env: ExecutionEnvironment) {
    }

    execute(args: ResolvedArguments, node: ASTNode) {
        let name = args['name'];
        this.env.simulator.addMessage(`Defining function '${name}`, LogCategory.Simulator);
        this.env.addFunction(name, node);
    }
}

export class StartFunction implements FunctionExecution {
    constructor(private env: ExecutionEnvironment,
        private nodes: ASTNode[]) {
    }

    execute(args: ResolvedArguments, node: ASTNode) {
        this.env.simulator.addMessage(`Starting function '${node.token.value}`, LogCategory.Simulator);
        this.env.script.startFrame(this.nodes);
    }
}
