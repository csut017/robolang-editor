import { ValidationResult, ASTNode } from '../services/validation.service';
import { ExecutionEnvironment } from './simulator/environment';
import { MessageLog, LogCategory } from './simulator/message-log';
import { RobotResource } from './robot-resource';

export class RobotSimulator extends MessageLog {
    scripts: InternalScript[];
    stack: InternalScript[];
    error: string;
    finished: boolean;
    currentScript: number;

    constructor() {
        super();
        this.scripts = [];
        this.stack = [];
        this.currentScript = 0;
    }

    initialise(): void {
        this.addMessage('Initialising simulator', LogCategory.Simulator);
    }

    start(startingScript: string): void {
        this.finished = false;
        this.startScript(startingScript);
    }

    addScript(script: ValidationResult, resources: RobotResource[]) {
        this.scripts.push(new InternalScript(script, resources || []));
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

export class InternalScript extends ValidationResult {
    isCurrent: boolean;
    frames: ScriptFrame[] = [];
    currentFrame: number;
    environment: ExecutionEnvironment;
    resources: RobotResource[];

    constructor(result: ValidationResult, resources: RobotResource[]) {
        super();
        this.ast = result.ast;
        this.source = result.source;
        this.resources = resources;
    }

    start(log: MessageLog, parent?: InternalScript): InternalScript {
        let started = new InternalScript(this, this.resources);
        started.currentFrame = started.frames.push(new ScriptFrame(started.ast, true));
        var env: ExecutionEnvironment;
        if (parent) env = parent.environment;
        started.environment = new ExecutionEnvironment(started, log, env);
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
