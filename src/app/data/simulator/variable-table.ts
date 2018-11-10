export class VariableTable {
    variables: Variable[] = [];

    constructor(private parent?: VariableTable) {

    }

    get(name: string): Variable {
        let out = this.variables.find(v => v.name == name);
        if (!out && this.parent) out = this.parent.get(name);
        return out;
    }

    set(name: string, value: any, isServer?: boolean): Variable {
        let out = this.get(name);
        return this.updateVariable(out, name, value, isServer);
    }

    setLocal(name: string, value: any, isServer?: boolean): Variable {
        let out = this.variables.find(v => v.name == name);
        return this.updateVariable(out, name, value, isServer);
    }

    private updateVariable(out: Variable, name: string, value: any, isServer: boolean): Variable {
        if (!out) {
            out = new Variable(name, isServer);
            this.variables.push(out);
        }

        out.value = value;
        return out;
    }
}

export class Variable {
    name: string;
    value: any;
    isServer: boolean;

    constructor(name: string, isServer: boolean) {
        this.name = name;
        this.isServer = isServer;
    }
}