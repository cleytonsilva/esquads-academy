/**
 * Command Processor
 * Processador de comandos para o terminal interativo
 * Baseado no SimulatorTerminal e expandido com funcionalidades avançadas
 */

import { MissionCategory } from '@/types/missions'

export interface CommandResult {
  success: boolean
  output: string
  error?: string
  points?: number
  executionTime?: number
  metadata?: Record<string, any>
}

export interface CommandConfig {
  category?: MissionCategory | string
  availableCommands?: string[]
  environmentVariables?: Record<string, string>
  customCommands?: Record<string, (args: string[]) => CommandResult>
}

export class CommandProcessor {
  private config: CommandConfig = {}
  private commandHistory: string[] = []
  private startTime: number = 0

  // Comandos básicos disponíveis em todas as categorias
  private readonly baseCommands = [
    'help', 'clear', 'ls', 'cat', 'pwd', 'whoami', 'history', 'echo', 'date', 'uptime'
  ]

  // Comandos por categoria (baseado no protótipo)
  private readonly commandsByCategory: Record<string, string[]> = {
    'Firewall': ['iptables', 'ufw', 'netstat', 'nmap', 'ss', 'firewall-cmd'],
    'Cloud Security': ['aws', 'kubectl', 'docker', 'terraform', 'gcloud', 'az'],
    'Forensics': ['volatility', 'autopsy', 'strings', 'hexdump', 'file', 'binwalk'],
    'Network Security': ['wireshark', 'nmap', 'netcat', 'curl', 'ping', 'traceroute'],
    'Penetration Testing': ['metasploit', 'nmap', 'burpsuite', 'sqlmap', 'nikto', 'hydra'],
    'Incident Response': ['syslog', 'journalctl', 'ps', 'netstat', 'lsof', 'tcpdump'],
    'Vulnerability Assessment': ['nessus', 'openvas', 'nmap', 'nikto', 'wpscan', 'dirb'],
    'Web Security': ['burpsuite', 'sqlmap', 'nikto', 'wpscan', 'gobuster', 'ffuf'],
    'Cryptography': ['openssl', 'gpg', 'hashcat', 'john', 'steghide', 'base64'],
  }

  configure(config: CommandConfig): void {
    this.config = { ...this.config, ...config }
  }

  getAvailableCommands(): string[] {
    const categoryCommands = this.getCategoryCommands()
    const customCommands = Object.keys(this.config.customCommands || {})
    return [...this.baseCommands, ...categoryCommands, ...customCommands]
  }

  private getCategoryCommands(): string[] {
    const category = this.config.category as string
    if (this.config.availableCommands && this.config.availableCommands.length > 0) {
      return this.config.availableCommands
    }
    return this.commandsByCategory[category] || this.commandsByCategory['Network Security']
  }

  async executeCommand(command: string): Promise<CommandResult> {
    this.startTime = Date.now()
    const trimmedCommand = command.trim()
    
    if (!trimmedCommand) {
      return this.createResult(false, 'Comando vazio')
    }

    this.commandHistory.push(trimmedCommand)
    const [baseCommand, ...args] = trimmedCommand.split(' ')
    const lowerCommand = baseCommand.toLowerCase()

    // Verificar comandos customizados primeiro
    if (this.config.customCommands && this.config.customCommands[lowerCommand]) {
      return this.config.customCommands[lowerCommand](args)
    }

    // Comandos básicos
    if (this.baseCommands.includes(lowerCommand)) {
      return this.executeBasicCommand(lowerCommand, args)
    }

    // Comandos específicos da categoria
    const categoryCommands = this.getCategoryCommands()
    if (categoryCommands.includes(lowerCommand)) {
      return this.executeCategoryCommand(lowerCommand, args)
    }

    // Comando não encontrado
    return this.createResult(
      false, 
      `bash: ${baseCommand}: comando não encontrado\nDica: Digite "help" para ver comandos disponíveis.`
    )
  }

  private executeBasicCommand(command: string, args: string[]): CommandResult {
    switch (command) {
      case 'help':
        return this.createResult(true, this.generateHelpOutput(), undefined, 0)
      
      case 'clear':
        return this.createResult(true, '[CLEAR_TERMINAL]', undefined, 0)
      
      case 'ls':
        return this.createResult(true, this.generateLsOutput(args))
      
      case 'cat':
        return this.createResult(true, this.generateCatOutput(args))
      
      case 'pwd':
        return this.createResult(true, '/home/esquads')
      
      case 'whoami':
        return this.createResult(true, 'esquads')
      
      case 'history':
        return this.createResult(true, this.generateHistoryOutput())
      
      case 'echo':
        return this.createResult(true, args.join(' '))
      
      case 'date':
        return this.createResult(true, new Date().toLocaleString())
      
      case 'uptime':
        return this.createResult(true, 'up 2 days, 14:32, 1 user, load average: 0.15, 0.10, 0.05')
      
      default:
        return this.createResult(false, `Comando básico '${command}' não implementado`)
    }
  }

  private executeCategoryCommand(command: string, args: string[]): CommandResult {
    const category = this.config.category as string
    const response = this.generateCategoryCommandResponse(command, args, category)
    const points = this.calculatePoints(command, category)
    
    return this.createResult(true, response, undefined, points)
  }

  private generateHelpOutput(): string {
    const category = this.config.category || 'Network Security'
    const categoryCommands = this.getCategoryCommands()
    const customCommands = Object.keys(this.config.customCommands || {})
    
    let output = `Comandos disponíveis para ${category}:\n\n`
    output += `Básicos: ${this.baseCommands.join(', ')}\n\n`
    output += `Específicos: ${categoryCommands.join(', ')}\n`
    
    if (customCommands.length > 0) {
      output += `\nCustomizados: ${customCommands.join(', ')}\n`
    }
    
    output += `\nDica: Use os comandos específicos da categoria para completar os objetivos.`
    
    return output
  }

  private generateLsOutput(args: string[]): string {
    const baseFiles = ['bin', 'boot', 'dev', 'etc', 'home', 'lib', 'media', 'mnt', 'opt', 'proc', 'root', 'run', 'sbin', 'srv', 'sys', 'tmp', 'usr', 'var']
    
    if (args.includes('-la') || args.includes('-l')) {
      return baseFiles.map(file => 
        `drwxr-xr-x 2 root root 4096 Jan 15 10:30 ${file}`
      ).join('\n')
    }
    
    return baseFiles.join('  ')
  }

  private generateCatOutput(args: string[]): string {
    if (args.length === 0) {
      return 'Usage: cat [file]\nExample: cat /etc/passwd'
    }
    
    const file = args[0]
    const mockFiles: Record<string, string> = {
      '/etc/passwd': 'root:x:0:0:root:/root:/bin/bash\neschads:x:1000:1000:Esquads User:/home/esquads:/bin/bash',
      '/etc/hosts': '127.0.0.1 localhost\n127.0.1.1 esquads-terminal',
      'README.md': '# Esquads Terminal\n\nTerminal interativo para missões de cybersecurity.',
    }
    
    return mockFiles[file] || `cat: ${file}: No such file or directory`
  }

  private generateHistoryOutput(): string {
    if (this.commandHistory.length === 0) {
      return 'Nenhum comando executado ainda.'
    }
    
    return this.commandHistory
      .map((cmd, index) => `${index + 1}  ${cmd}`)
      .join('\n')
  }

  private generateCategoryCommandResponse(command: string, args: string[], category: string): string {
    const responses: Record<string, Record<string, string>> = {
      'Firewall': {
        iptables: 'Chain INPUT (policy ACCEPT)\ntarget     prot opt source               destination\nACCEPT     tcp  --  anywhere             anywhere             tcp dpt:ssh\nACCEPT     tcp  --  anywhere             anywhere             tcp dpt:http\nDROP       all  --  anywhere             anywhere',
        ufw: 'Status: active\n\nTo                         Action      From\n--                         ------      ----\n22/tcp                     ALLOW       Anywhere\n80/tcp                     ALLOW       Anywhere\n443/tcp                    ALLOW       Anywhere',
        netstat: 'Active Internet connections (only servers)\nProto Recv-Q Send-Q Local Address           Foreign Address         State\ntcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN\ntcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN\ntcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN',
        nmap: 'Starting Nmap 7.91 ( https://nmap.org )\nHost is up (0.001s latency).\nNot shown: 997 closed ports\nPORT    STATE SERVICE\n22/tcp  open  ssh\n80/tcp  open  http\n443/tcp open  https',
      },
      'Cloud Security': {
        aws: 'AWS CLI 2.0.55\nUsage: aws [options] <command> <subcommand>\n\nAvailable services:\n  s3, ec2, rds, lambda, iam, cloudformation',
        kubectl: 'Client Version: version.Info{Major:"1", Minor:"21", GitVersion:"v1.21.0"}\nServer Version: version.Info{Major:"1", Minor:"20", GitVersion:"v1.20.4"}\n\nAvailable commands:\n  get, create, delete, apply, describe, logs',
        docker: 'Docker version 20.10.7, build f0df350\n\nUsage: docker [OPTIONS] COMMAND\n\nCommands:\n  run, build, push, pull, images, ps, exec, logs',
        terraform: 'Terraform v1.0.0\non linux_amd64\n\nUsage: terraform [global options] <subcommand> [args]\n\nCommands:\n  init, plan, apply, destroy, validate, fmt',
      },
      'Forensics': {
        volatility: 'Volatility Foundation Volatility Framework 2.6.1\n\nUsage: volatility [options] plugin [plugin options]\n\nAvailable plugins:\n  pslist, pstree, cmdline, filescan, malfind, apihooks',
        autopsy: 'Autopsy 4.19.0\nDigital Forensics Platform\n\nCase management system initialized.\nReady for evidence analysis.',
        strings: 'Searching for ASCII strings in memory dump...\nFound 1247 readable strings\n\nSample output:\n  /bin/bash\n  /usr/bin/python3\n  /etc/passwd\n  192.168.1.100',
        hexdump: '0000000 7f45 4c46 0201 0001 0000 0000 0000 0000\n0000010 0002 003e 0001 0000 1040 0000 0000 0000\n0000020 0040 0000 0000 0000 3800 0000 0000 0000',
      },
      'Network Security': {
        wireshark: 'Wireshark 3.4.0 (Git v3.4.0 packaged as 3.4.0-1)\n\nCapturing on interface eth0...\nPackets captured: 0\nPackets displayed: 0',
        nmap: 'Starting Nmap 7.91 ( https://nmap.org )\nHost is up (0.001s latency).\nNot shown: 998 closed ports\nPORT   STATE SERVICE\n22/tcp open  ssh\n80/tcp open  http',
        netcat: 'Netcat 1.10-41.1ubuntu1\nUsage: nc [options] hostname port\n\nOptions:\n  -l  listen mode\n  -p  local port\n  -u  UDP mode',
        curl: 'curl 7.68.0 (x86_64-pc-linux-gnu)\nUsage: curl [options...] <url>\n\nOptions:\n  -X  request method\n  -H  header\n  -d  data',
      },
      'Penetration Testing': {
        metasploit: 'Metasploit Framework Console 6.0.0\n\n=[ metasploit v6.0.0-dev                          ]\n+ -- --=[ 2048 exploits - 1105 auxiliary - 344 post       ]\n+ -- --=[ 566 payloads - 45 encoders - 10 nops            ]',
        burpsuite: 'Burp Suite Professional v2021.8\n\nProxy server started on 127.0.0.1:8080\nIntercept is OFF\nReady for web application testing.',
        sqlmap: 'sqlmap 1.6.2#stable\n\nUsage: python sqlmap.py [options]\n\nTarget:\n  -u URL, --url=URL   Target URL (e.g. "http://www.site.com/vuln.php?id=1")',
        nikto: 'Nikto 2.1.6\n- Web Server Scanner\n\nUsage: nikto [options] -host <host>\n\nOptions:\n  -h  target host\n  -p  port\n  -ssl  use SSL',
      },
      'Incident Response': {
        syslog: 'Syslog daemon v1.5.1\nLogging facility initialized\nLog files: /var/log/syslog, /var/log/auth.log, /var/log/kern.log',
        journalctl: 'systemd journal v247\n\nShowing entries from system journal:\nJan 15 10:30:00 esquads systemd[1]: Started Network Manager.',
        ps: 'PID TTY          TIME CMD\n   1 ?        00:00:01 systemd\n   2 ?        00:00:00 kthreadd\n 123 ?        00:00:00 sshd\n 456 pts/0    00:00:00 bash',
        lsof: 'COMMAND    PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME\nsystemd      1 root  cwd    DIR  259,1     4096    2 /\nsshd       123 root    3u  IPv4  12345      0t0  TCP *:ssh (LISTEN)',
      },
      'Vulnerability Assessment': {
        nessus: 'Nessus 8.15.0\nVulnerability Scanner\n\nScanner Status: Ready\nPlugin Set: 2021-01-15\nTotal Plugins: 156,789',
        openvas: 'OpenVAS 20.08\nVulnerability Assessment System\n\nGreenbone Security Assistant\nScanner daemon: Running\nFeed status: Current',
        nikto: 'Nikto 2.1.6\nWeb Server Scanner\n\nTarget: http://example.com\nPort: 80\nStart Time: 2024-01-15 10:30:00',
        wpscan: 'WPScan 3.8.0\nWordPress Security Scanner\n\nTarget URL: http://wordpress.example.com\nWordPress version: 5.8.1\nTheme: twentytwentyone',
      },
      'Web Security': {
        burpsuite: 'Burp Suite Professional v2021.8\n\nProxy Configuration:\n  Listen on: 127.0.0.1:8080\n  Intercept: OFF\n  History: 0 items',
        sqlmap: 'sqlmap 1.6.2#stable\n\nAutomatic SQL injection and database takeover tool\n\nTarget URL: http://example.com/page.php?id=1\nTesting parameter: id',
        gobuster: 'Gobuster v3.1.0\nDirectory/File enumeration tool\n\nTarget: http://example.com\nWordlist: /usr/share/wordlists/dirb/common.txt',
        ffuf: 'Fuzz Faster U Fool v1.3.1\nWeb fuzzer written in Go\n\nTarget: http://example.com/FUZZ\nWordlist: /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt',
      },
      'Cryptography': {
        openssl: 'OpenSSL 1.1.1f  31 Mar 2020\n\nUsage: openssl command [command_opts] [command_args]\n\nCommands:\n  genrsa, rsa, req, x509, enc, dgst, rand',
        gpg: 'gpg (GnuPG) 2.2.19\nlibgcrypt 1.8.5\n\nUsage: gpg [options] [files]\n\nCommands:\n  --gen-key, --encrypt, --decrypt, --sign, --verify',
        hashcat: 'hashcat 6.1.1\n\nUsage: hashcat [options]... hash|hashfile|hccapxfile [dictionary|mask|directory]...\n\nHash modes:\n  0 = MD5\n  100 = SHA1\n  1400 = SHA2-256',
        john: 'John the Ripper 1.9.0-jumbo-1\n\nUsage: john [OPTIONS] [PASSWORD-FILES]\n\nOptions:\n  --wordlist=FILE  wordlist mode\n  --rules          enable word mangling rules',
      },
    }

    const categoryResponses = responses[category] || responses['Network Security']
    const response = categoryResponses[command]
    
    if (response) {
      return response
    }
    
    return `Executando: ${command} ${args.join(' ')}\n[Simulação] Comando executado com sucesso.\n+10 XP`
  }

  private calculatePoints(command: string, category: string): number {
    // Comandos básicos não dão pontos
    if (this.baseCommands.includes(command)) {
      return 0
    }
    
    // Comandos específicos da categoria dão mais pontos
    const categoryCommands = this.getCategoryCommands()
    if (categoryCommands.includes(command)) {
      return 10
    }
    
    return 5
  }

  private createResult(
    success: boolean, 
    output: string, 
    error?: string, 
    points: number = 0
  ): CommandResult {
    const executionTime = Date.now() - this.startTime
    
    return {
      success,
      output,
      error,
      points,
      executionTime,
      metadata: {
        timestamp: new Date(),
        category: this.config.category,
      }
    }
  }

  // Métodos utilitários
  getCommandHistory(): string[] {
    return [...this.commandHistory]
  }

  clearHistory(): void {
    this.commandHistory = []
  }

  getEnvironmentVariable(key: string): string | undefined {
    return this.config.environmentVariables?.[key]
  }

  setEnvironmentVariable(key: string, value: string): void {
    if (!this.config.environmentVariables) {
      this.config.environmentVariables = {}
    }
    this.config.environmentVariables[key] = value
  }
}