enum logLevels {
    DEBUG = 0,
    INFO = 1,
    WARNING = 2,
    ERROR = 3
};

export default class Logger {

    public name: string;

    constructor(name: string){
        this.name = name;
    }

    log = (level: string, message: string) => {
        let finalLine = `${new Date().toISOString()} [${this.name}] ${level}: ${message}`;
        console.log(finalLine);
    }

    debug = (message: string) => {
        this.log('DEBUG', message);
    }

    info = (message: string) => {
        this.log('INFO', message);
    }

    warn = (message: string) => {
        this.log('WARN', message);
    }

    error = (message: string) => {
        this.log('ERROR', message);
    }
}