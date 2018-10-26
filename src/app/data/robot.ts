import { RobotScript } from './robot-script'

export class Robot {
    id: number;
    display: string;
    name: string;
    address: string;
    lastAccess: string;
    robotType: string;

    // Patient details
    patient: string;
    nhi: string;

    // Download details
    checksum: string;
    scripts: RobotScript[];

    // Internal information
    isLoaded: boolean;
    isAdding: boolean;
    original: Robot;
}
