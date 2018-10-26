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

    // Internal information
    isLoaded: boolean;
    isAdding: boolean;
    original: Robot;
}
