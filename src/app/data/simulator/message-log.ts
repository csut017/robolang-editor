import * as moment from 'moment';

export class MessageLog {
    messages: LogMessage[] = [];

    addMessage(message: string, category?: string): LogMessage {
        const id = this.messages.length + 1;
        let msg = new LogMessage(id, message, category || LogCategory.Control);
        this.messages.unshift(msg);
        return msg;
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