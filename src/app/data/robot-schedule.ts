export class RobotSchedule {
    event_id: string;
    script: string;
    run: boolean;
    time: string;
    environment: any;

    static compare(a: RobotSchedule, b: RobotSchedule): number {
        if (a.time == b.time) {
            return a.script == b.script ? 0 : a.script > b.script ? 1 : -1;
        }
        return a.time > b.time ? 1 : -1;
    }
}