export class RobotScript {
    name: string;

    static compare(a: RobotScript, b: RobotScript): number {
        return a.name == b.name ? 0 : a.name > b.name ? 1 : -1;
    }
}