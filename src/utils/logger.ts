/**
 * Sistema de logging centralizado para o Esquads
 * Substitui console.log/warn/error por um sistema mais robusto
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  userId?: string;
}

class Logger {
  private currentLevel: LogLevel = LogLevel.INFO;
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  setLevel(level: LogLevel) {
    this.currentLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level];
    const contextStr = context ? `[${context}]` : '';
    return `${timestamp} ${levelStr} ${contextStr} ${message}`;
  }

  private addToHistory(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  debug(message: string, data?: any, context?: string) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      message,
      context,
      data
    };

    this.addToHistory(entry);

    if (this.isDevelopment) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context), data || '');
    }
  }

  info(message: string, data?: any, context?: string) {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      context,
      data
    };

    this.addToHistory(entry);

    if (this.isDevelopment) {
      console.info(this.formatMessage(LogLevel.INFO, message, context), data || '');
    }
  }

  warn(message: string, data?: any, context?: string) {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      context,
      data
    };

    this.addToHistory(entry);

    console.warn(this.formatMessage(LogLevel.WARN, message, context), data || '');
  }

  error(message: string, error?: any, context?: string) {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      context,
      data: error
    };

    this.addToHistory(entry);

    console.error(this.formatMessage(LogLevel.ERROR, message, context), error || '');
  }

  // Métodos específicos para contextos comuns
  auth(message: string, data?: any) {
    this.info(message, data, 'AUTH');
  }

  database(message: string, data?: any) {
    this.info(message, data, 'DATABASE');
  }

  api(message: string, data?: any) {
    this.info(message, data, 'API');
  }

  performance(message: string, data?: any) {
    this.info(message, data, 'PERFORMANCE');
  }

  security(message: string, data?: any) {
    this.warn(message, data, 'SECURITY');
  }

  // Obter histórico de logs
  getHistory(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  // Limpar histórico
  clearHistory() {
    this.logs = [];
  }

  // Exportar logs para análise
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Instância singleton
export const logger = new Logger();

// Configurar nível baseado no ambiente
if (import.meta.env.PROD) {
  logger.setLevel(LogLevel.WARN);
} else {
  logger.setLevel(LogLevel.DEBUG);
}

export default logger;