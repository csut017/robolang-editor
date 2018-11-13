import * as moment from 'moment';
import { ASTNode } from 'src/app/services/validation.service';
import { Duration } from './environment';

export class WaitState {
    stack: WaitFrame[] = [];

    add(priority: number): WaitFrame {
        let frame = new WaitFrame(priority);
        this.stack.push(frame);
        this.stack.sort((a, b) => a.priority == b.priority ? 0: a.priority > b.priority ? 1 : -1);
        return frame;
    }

    remove(frame: WaitFrame) {
        const index = this.stack.indexOf(frame);
        this.stack.splice(index, 1);
    }

    reset() {
        this.stack = [];
    }
}

export class WaitFrame {
    priority: number;
    timeout: moment.Moment;
    responseHandlers: WaitHandler[] = [];
    timeoutHandler: WaitHandler;
    defaultHandler: WaitHandler;

    constructor(priority: number) {
        this.priority = priority;
    }

    addResponse(node: ASTNode, text: string) {
        let handler = new WaitHandler(this);
        handler.type = WaitHandlerType.response;
        handler.text = text;
        handler.node = node;
        this.responseHandlers.push(handler);
    }

    addTimeout(node: ASTNode, timeout: Duration) {
        let handler = new WaitHandler(this);
        handler.type = WaitHandlerType.timeout;
        handler.node = node;
        this.timeoutHandler = handler;
        this.timeout = timeout.toTime();
    }

    addDefault(node: ASTNode, variableName: string) {
        let handler = new WaitHandler(this);
        handler.type = WaitHandlerType.default;
        handler.node = node;
        handler.text = variableName;
        this.defaultHandler = handler;
    }
}

export class WaitHandlerType {
    static response: string = 'response';
    static timeout: string = 'timeout';
    static default: string = 'default';

    static order: { [index: string]: number } = {
        'response': 0,
        'timeout': 1,
        'default': 2
    }
}

export class WaitHandler {
    node: ASTNode;
    text: string;
    type: string;

    constructor(public parent: WaitFrame) {}
}