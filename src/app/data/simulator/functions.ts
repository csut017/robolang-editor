import { ExecutionEnvironment, ResolvedArguments, Duration } from "./environment";
import { ASTNode } from "src/app/services/validation.service";
import { LogCategory } from "./message-log";
import { environment } from "src/environments/environment";
import { WaitFrame } from "./wait-state";

export interface FunctionExecution {
    execute(ResolvedArguments, ASTNode);
}

export class DefineFunction implements FunctionExecution {
    constructor(private env: ExecutionEnvironment) {
    }

    execute(args: ResolvedArguments, node: ASTNode) {
        let name = args['name'];
        this.env.log.addMessage(`Defining function '${name}`, LogCategory.Simulator);
        this.env.addFunction(name, node);
    }
}

export class DefineOrSetVariable implements FunctionExecution {
    constructor(private env: ExecutionEnvironment) {
    }

    execute(args: ResolvedArguments, node: ASTNode) {
        let name = args['name'],
            value = args['value'],
            defaultValue = args['default'],
            isServer = !!args['server'],
            varType = isServer ? 'server' : 'local';

        if (!value) {
            this.env.log.addMessage(`Retrieving ${varType} variable '${name}'`, LogCategory.Simulator);
            let variable = this.env.variables.get(name);
            let newVar = variable;
            if (variable) {
                newVar = variable.value;
            } else {
                newVar = defaultValue;
            }
            let varText = typeof newVar == 'string'
                ? `'${newVar}'`
                : newVar.toString();
            this.env.log.addMessage(`Using ${varText} for variable '${name}'`, LogCategory.Simulator);
            this.env.variables.setLocal(name, newVar, isServer);
        } else {
            this.env.log.addMessage(`Setting ${varType} variable to '${name}'`, LogCategory.Simulator);
            this.env.variables.set(name, value, isServer);
        }
    }
}

export class EnterWait implements FunctionExecution {
    constructor(private env: ExecutionEnvironment) {
    }

    execute(args: ResolvedArguments, node: ASTNode) {
        let priority = args['priority'] || 5,
            timeout = args['timeout'],
            timeoutText = timeout ? timeout.toString() : 'never';
        this.env.log.addMessage(`Entering wait state [priority=${priority},timeout=${timeoutText}]`, LogCategory.Simulator);

        let wait = this.env.waitState.add(priority);
        for (var child of node.children) {
            this.processChild(child, wait, timeout);
        }

        this.env.state = 'Waiting';
    }

    private processChild(node: ASTNode, wait: WaitFrame, timeout: Duration) {
        const args = this.env.resolveArguments(node);
        switch (node.token.value) {
            case 'response':
                let text = args['text'];
                this.env.log.addMessage(`Register response=${text}`);
                wait.addResponse(node, text);
                break;

            case 'timeout':
                this.env.log.addMessage(`Register timeout`);
                wait.addTimeout(node, timeout);
                break;

            case 'default':
                let varName = args['variable'];
                if (varName) {
                    this.env.log.addMessage(`Register default into ${varName}`);
                } else {
                    this.env.log.addMessage('Register default');
                }
                wait.addDefault(node, varName);
                break;

            default:
                throw `Unknown wait child: '${node.token.type}'`;
        }
    }
}

export class PlaySound implements FunctionExecution {
    constructor(private env: ExecutionEnvironment) {
    }

    execute(args: ResolvedArguments, node: ASTNode) {
        let name = args['sound'];
        this.env.log.addMessage(`Playing sound '${name}'`, LogCategory.Simulator);
        let res = this.env.findResource(name);
        if (res) {
            const url = `${environment.baseURL}${res.url}`;
            this.env.log.addMessage(`Loading audio from '${url}`, LogCategory.Simulator);
            let sound = new Audio(url);
            sound.play();
        } else {
            throw `Unable to find resource '${name}'`;
        }
    }
}

export class SaySpeech implements FunctionExecution {
    constructor(private env: ExecutionEnvironment) {
    }

    execute(args: ResolvedArguments, node: ASTNode) {
        let text = args['speech'];
        this.env.log.addMessage(`Saying '${text}`, LogCategory.Simulator);
        if (window.speechSynthesis) {
            var msg = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(msg);
        }
    }
}

export class ShowScreen implements FunctionExecution {
    constructor(private env: ExecutionEnvironment) {
    }

    execute(args: ResolvedArguments, node: ASTNode) {
        let name = args['screen'];
        this.env.log.addMessage(`Showing screen '${name}`, LogCategory.Simulator);
    }
}

export class StartFunction implements FunctionExecution {
    constructor(private env: ExecutionEnvironment,
        private nodes: ASTNode[]) {
    }

    execute(args: ResolvedArguments, node: ASTNode) {
        this.env.log.addMessage(`Starting function '${node.token.value}`, LogCategory.Simulator);
        this.env.script.startFrame(this.nodes);
    }
}
