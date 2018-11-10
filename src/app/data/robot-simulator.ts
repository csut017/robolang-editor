import * as moment from 'moment';
import { ValidationResult, ASTNode, ASTToken } from '../services/validation.service';
import { ExecutionEnvironment } from './simulator/environment';

export class RobotSimulator {
    messages: LogMessage[];
    scripts: InternalScript[];
    stack: InternalScript[];
    error: string;
    finished: boolean;
    currentScript: number;

    constructor() {
        this.messages = [];
        this.scripts = [];
        this.stack = [];
        this.currentScript = 0;
    }

    initialise(): void {
        this.addMessage('Initialising simulator', LogCategory.Simulator);
    }

    addMessage(message: string, category?: string): LogMessage {
        const id = this.messages.length + 1;
        let msg = new LogMessage(id, message, category || LogCategory.Control);
        this.messages.unshift(msg);
        return msg;
    }

    start(startingScript: string): void {
        this.finished = false;
        this.startScript(startingScript);
    }

    addScript(script: ValidationResult) {
        this.scripts.push(new InternalScript(script));
    }

    executeNext(): void {
        if (!this.currentScript) {
            this.addMessage('Simulator has finished', LogCategory.Error);
            return;
        }

        let currentScript = this.stack[this.currentScript - 1];
        let currentNode = currentScript.getCurrent();
        if (currentNode) {
            try {
                this.executeNode(currentScript, currentNode);
            } catch (error) {
                this.addMessage(`!! ${error} !!`, LogCategory.Error);
                this.currentScript = 0;
                return;
            }
        }

        let hasNext = currentScript.moveNext();
        while (!hasNext) {
            this.currentScript--;
            this.stack.pop();
            if (!this.currentScript) {
                this.finished = true;
                break;
            }

            currentScript = this.stack[this.currentScript - 1];
            hasNext = currentScript.hasNext();
        }
    }

    private executeNode(script: InternalScript, node: ASTNode) {
        let env = script.environment;
        let func = env.findFunction(node.token.value);
        let args = env.resolveArguments(node);
        func.execute(args, node);
    }

    private startScript(scriptName: string): void {
        let scriptToStart = this.scripts.find(s => s.source.name == scriptName);
        if (!scriptToStart) {
            this.error = `Unable to find script ${scriptName}`;
            this.addMessage(this.error, LogCategory.Error);
            this.currentScript = 0;
            return;
        }

        if (this.currentScript) {
            this.stack[this.currentScript - 1].isCurrent = false;
        }
        let newScript = scriptToStart.start(this);
        newScript.isCurrent = true;
        this.currentScript = this.stack.push(newScript);
        this.addMessage(`Starting script ${scriptName}`, LogCategory.Simulator);
    }
}

export type ResolvedArguments = { [index: string]: any };

class InternalScript extends ValidationResult {
    isCurrent: boolean;
    frames: ScriptFrame[] = [];
    currentFrame: number;
    environment: ExecutionEnvironment;

    constructor(result: ValidationResult) {
        super();
        this.ast = result.ast;
        this.source = result.source;
    }

    start(simulator: RobotSimulator): InternalScript {
        let started = new InternalScript(this);
        started.currentFrame = started.frames.push(new ScriptFrame(started.ast, true));
        started.environment = new ExecutionEnvironment(started, simulator);
        return started;
    }

    startFrame(nodes: ASTNode[]) {
        this.currentFrame = this.frames.push(new ScriptFrame(nodes));
    }

    getCurrent(): ASTNode {
        if (!this.currentFrame) return;
        let currentFrame = this.frames[this.currentFrame - 1];
        let frameNode = currentFrame.getCurrent();
        return frameNode;
    }

    hasNext(): boolean {
        return !!this.currentFrame;
    }

    moveNext(): boolean {
        while (this.currentFrame) {
            let currentFrame = this.frames[this.currentFrame - 1];
            if (currentFrame.moveNext()) return true;

            this.currentFrame--;
            this.frames.pop();
        }
        return false;
    }
}

class ScriptFrame {
    nodes: ASTNode[];
    currentFrame: number;

    constructor(nodes: ASTNode[], isRoot?: boolean) {
        this.nodes = nodes;
        this.currentFrame = isRoot ? 0 : -1;
    }

    getCurrent(): ASTNode {
        if (this.currentFrame >= this.nodes.length) return;

        return this.nodes[this.currentFrame];
    }

    moveNext(): boolean {
        this.currentFrame++;
        return this.currentFrame < this.nodes.length;
    }
}

export class LogCategory {
    static Simulator: string = 'Simulator';
    static Control: string = 'Control';
    static Error: string = 'Error';
};

export class LogMessage {
    when = moment();
    message: string;
    category: string;
    id: number;

    constructor(id: number, message: string, category: string) {
        this.id = id;
        this.message = message;
        this.category = category;
    }
}