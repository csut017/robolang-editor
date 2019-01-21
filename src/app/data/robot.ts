import { RobotScript } from './robot-script'
import { RobotResource } from './robot-resource';

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
    resources: RobotResource[];

    // Internal information
    isLoaded: boolean;
    isAdding: boolean;
    original: Robot;
    scriptsAreValid: boolean = true;
    errorMessage: string = 'One or more of the scripts cannot be downloaded.';
}
