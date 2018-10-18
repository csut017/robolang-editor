export class RobotWaitState {
    script: string;
    response: string;
    priority: number;

    static compare(a: RobotWaitState, b: RobotWaitState): number {
        if (a.priority == b.priority) {
            return a.script == b.script ? 0 : a.script > b.script ? 1 : -1;
        }
        return a.priority > b.priority ? -1 : 1;
    }
}