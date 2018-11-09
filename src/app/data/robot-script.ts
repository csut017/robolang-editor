import { RobotResource } from "./robot-resource";

export class RobotScript {
    id: number;
    name: string;
    script: string;
    source: string;
    resources: RobotResource[];
    expanded: boolean;
    compiled: boolean;
}