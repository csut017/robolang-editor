import { ValidationResult, ASTNode } from '../services/validation.service';
import { ExecutionEnvironment } from './simulator/environment';
import { MessageLog, LogCategory } from './simulator/message-log';
import { RobotResource } from './robot-resource';
import { WaitState, WaitHandler } from './simulator/wait-state';

export class RobotSimulator extends MessageLog {
    scriptManager: ScriptManager;
    error: string;
    finished: boolean;
    executionEnvironment: ExecutionEnvironment;
    waitState: WaitState;

    constructor() {
        super();
        this.scriptManager = new ScriptManager(this);
    }

    initialise(): void {
        this.addMessage('Initialising simulator', LogCategory.Simulator);
        this.scriptManager.initalise();
        this.executionEnvironment = null;
        this.finished = false;
        this.error = null;
        this.waitState = new WaitState();
    }

    start(startingScript: string): void {
        this.finished = false;
        this.startScript(startingScript);
    }

    addScript(script: ValidationResult, resources: RobotResource[]) {
        this.scriptManager.add(new InternalScript(script, resources || []));
    }

    executeNext(): void {
        if (!this.scriptManager.hasCurrent()) {
            this.addMessage('Simulator has finished', LogCategory.Error);
            return;
        }

        if (this.executionEnvironment.state == 'Waiting') {
            this.addMessage('Waiting for input', LogCategory.Simulator);
            return;
        }

        this.executeCurrent();
    }

    private executeCurrent() {
        let currentScript = this.scriptManager.getCurrent();
        let currentNode = currentScript.getCurrent();
        if (currentNode) {
            try {
                this.executeNode(currentScript, currentNode);
            } catch (error) {
                this.addMessage(`!! ${error} !!`, LogCategory.Error);
                this.scriptManager.clearCurrent();
                return;
            }
        }

        if (this.executionEnvironment.state == 'Waiting') {
            this.addMessage('Waiting for input', LogCategory.Simulator);
            return;
        }

        currentScript = this.scriptManager.getCurrent();
        let hasNext = currentScript.moveNext();
        while (!hasNext) {
            currentScript.environment.state = 'Completed';
            if (!this.scriptManager.returnToPrevious()) {
                this.finished = true;
                break;
            }

            currentScript = this.scriptManager.getCurrent();
            currentScript.environment.state = 'Running';
            hasNext = currentScript.hasNext();
            this.executionEnvironment = currentScript.environment;
        }
    }

    processInput(text: string) {
        let found = false;
        var handlerToUse: WaitHandler;
        for (let frame of this.waitState.stack) {
            for (let handler of frame.responseHandlers) {
                if (handler.text == text) {
                    found = true;
                    handlerToUse = handler;
                    break;
                }
            }
            if (found) {
                break;
            } else if (frame.defaultHandler) {
                handlerToUse = frame.defaultHandler;
                break;
            }
        }
        if (handlerToUse) this.executeHandler(handlerToUse);
    }

    processTimeout() {
        var handlerToUse: WaitHandler;
        for (let frame of this.waitState.stack) {
            if (frame.timeoutHandler) {
                handlerToUse = frame.timeoutHandler;
                break;
            }
        }
        if (handlerToUse) this.executeHandler(handlerToUse);
    }

    private executeHandler(handler: WaitHandler) {
        let currentScript = this.scriptManager.getCurrent();
        currentScript.findAndSetChild(handler.node);
        this.executionEnvironment.state = 'Running';
        this.waitState.remove(handler.parent);
        this.executeCurrent();
    }

    private executeNode(script: InternalScript, node: ASTNode) {
        let env = script.environment;
        let func = env.findFunction(node.token.value);
        let args = env.resolveArguments(node);
        func.execute(args, node);
    }

    private startScript(scriptName: string): void {
        let scriptToStart = this.scriptManager.find(scriptName);
        if (!scriptToStart) {
            this.error = `Unable to find script ${scriptName}`;
            this.addMessage(this.error, LogCategory.Error);
            this.scriptManager.clearCurrent();
            return;
        }

        if (this.scriptManager.hasCurrent()) {
            this.scriptManager.getCurrent().state.isCurrent = false;
        }
        let newScript = scriptToStart.start(this, this.waitState, this.scriptManager);
        newScript.state.isCurrent = true;
        this.scriptManager.startNew(newScript);
        this.addMessage(`Starting script ${scriptName}`, LogCategory.Simulator);

        let currentScript = this.scriptManager.getCurrent();
        this.executionEnvironment = currentScript.environment;
        this.executionEnvironment.state = 'Running';
    }
}

export class ScriptManager {
    scripts: InternalScript[];
    stack: InternalScript[];
    currentScript: number;

    constructor(private owner: RobotSimulator) {        
    }

    initalise(): void {
        this.scripts = [];
        this.stack = [];
        this.currentScript = 0;
    }

    add(script: InternalScript) {
        this.scripts.push(script);
    }

    hasCurrent(): boolean {
        return !!this.currentScript;
    }

    getCurrent(): InternalScript {
        let currentScript = this.stack[this.currentScript - 1];
        return currentScript;
    }

    clearCurrent(): void {
        this.currentScript = 0;
    }

    returnToPrevious(): boolean {
        this.currentScript--;
        this.stack.pop();
        return this.hasCurrent();
    }

    find(name: string): InternalScript {
        let script = this.scripts.find(s => s.source.name == name);
        return script;
    }

    startNew(script: InternalScript): void {
        let newScript = script.start(this.owner, this.owner.waitState, this.owner.scriptManager, this.getCurrent());
        this.currentScript = this.stack.push(newScript);
    }
}

export class InternalScript extends ValidationResult {
    state: ScriptState = new ScriptState();
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

    start(log: MessageLog, waitState: WaitState, scriptManager: ScriptManager, parent?: InternalScript): InternalScript {
        let started = new InternalScript(this, this.resources);
        started.state = this.state;
        started.currentFrame = started.frames.push(new ScriptFrame(started.ast, true));
        var env: ExecutionEnvironment;
        if (parent) env = parent.environment;
        started.environment = new ExecutionEnvironment(started, log, env, scriptManager);
        started.environment.waitState = waitState;
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

    findAndSetChild(child: ASTNode) {
        if (!this.currentFrame) return;
        let currentNode = this.getCurrent();
        let newNode = currentNode.children.find(n => n == child);
        this.startFrame(newNode.children);
        this.moveNext();
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

class ScriptState {
    isCurrent: boolean;
    isFinished: boolean;
}