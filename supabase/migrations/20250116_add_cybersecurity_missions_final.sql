-- Migration: Add Cybersecurity Missions and Badges
-- Description: Adds 6 cybersecurity missions with corresponding badges

-- Insert cybersecurity badges first
INSERT INTO public.badges (
  id,
  name,
  description,
  icon_url,
  points_required,
  color,
  rarity,
  category,
  requirements,
  is_active,
  share_text
) VALUES
  (
    'b1e2c3d4-5f6a-7b8c-9d0e-1f2a3b4c5d6e',
    'Linux Hardening Expert',
    'Especialista em hardening de servidores Linux',
    '🛡️',
    100,
    '#FF6B35',
    'rare',
    'achievement',
    '{"mission_id": "m1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c"}',
    true,
    'Conquistei o badge de Linux Hardening Expert! 🛡️'
  ),
  (
    'b2f3a4b5-6c7d-8e9f-0a1b-2c3d4e5f6a7b',
    'Web Security Analyst',
    'Analista de segurança em aplicações web',
    '🔍',
    150,
    '#E74C3C',
    'rare',
    'achievement',
    '{"mission_id": "m2b3c4d5-6e7f-8a9b-0c1d-2e3f4a5b6c7d"}',
    true,
    'Conquistei o badge de Web Security Analyst! 🔍'
  ),
  (
    'b3a4b5c6-7d8e-9f0a-1b2c-3d4e5f6a7b8c',
    'Digital Forensics Investigator',
    'Investigador forense digital',
    '🔬',
    120,
    '#9B59B6',
    'rare',
    'achievement',
    '{"mission_id": "m3c4d5e6-7f8a-9b0c-1d2e-3f4a5b6c7d8e"}',
    true,
    'Conquistei o badge de Digital Forensics Investigator! 🔬'
  ),
  (
    'b4b5c6d7-8e9f-0a1b-2c3d-4e5f6a7b8c9d',
    'Network Security Specialist',
    'Especialista em segurança de redes',
    '🌐',
    180,
    '#3498DB',
    'epic',
    'achievement',
    '{"mission_id": "m4d5e6f7-8a9b-0c1d-2e3f-4a5b6c7d8e9f"}',
    true,
    'Conquistei o badge de Network Security Specialist! 🌐'
  ),
  (
    'b5c6d7e8-9f0a-1b2c-3d4e-5f6a7b8c9d0e',
    'CTF Champion',
    'Campeão em Capture The Flag',
    '🏆',
    200,
    '#F39C12',
    'epic',
    'achievement',
    '{"mission_id": "m5e6f7a8-9b0c-1d2e-3f4a-5b6c7d8e9f0a"}',
    true,
    'Conquistei o badge de CTF Champion! 🏆'
  ),
  (
    'b6d7e8f9-0a1b-2c3d-4e5f-6a7b8c9d0e1f',
    'Container Security Expert',
    'Especialista em segurança de containers',
    '🐳',
    160,
    '#2ECC71',
    'rare',
    'achievement',
    '{"mission_id": "m6f7a8b9-0c1d-2e3f-4a5b-6c7d8e9f0a1b"}',
    true,
    'Conquistei o badge de Container Security Expert! 🐳'
  );

-- Insert cybersecurity missions
INSERT INTO public.missions (
  id,
  title,
  description,
  type,
  difficulty,
  points_reward,
  objective,
  content,
  steps,
  category,
  badge_reward
) VALUES
  (
    'm1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c',
    'Hardening de Servidor Linux',
    'Aprenda a fortalecer a segurança de um servidor Linux aplicando técnicas de hardening essenciais.',
    'terminal',
    'intermediate',
    100,
    'Aplicar técnicas de hardening em um servidor Linux para aumentar sua segurança',
    'Nesta missão, você irá aprender e aplicar técnicas fundamentais de hardening em servidores Linux. O hardening é o processo de fortalecer a segurança de um sistema através da redução de sua superfície de ataque.',
    '[
      {
        "title": "Atualizar o sistema",
        "description": "Mantenha o sistema sempre atualizado",
        "command": "sudo apt update && sudo apt upgrade -y",
        "expected_output": "Packages updated successfully"
      },
      {
        "title": "Configurar firewall",
        "description": "Configure o UFW (Uncomplicated Firewall)",
        "command": "sudo ufw enable && sudo ufw default deny incoming && sudo ufw default allow outgoing",
        "expected_output": "Firewall is active and enabled"
      },
      {
        "title": "Desabilitar serviços desnecessários",
        "description": "Liste e desabilite serviços não utilizados",
        "command": "sudo systemctl list-unit-files --type=service --state=enabled",
        "expected_output": "List of enabled services"
      },
      {
        "title": "Configurar SSH seguro",
        "description": "Edite a configuração do SSH para maior segurança",
        "command": "sudo nano /etc/ssh/sshd_config",
        "expected_output": "SSH configuration file opened"
      },
      {
        "title": "Verificar logs de segurança",
        "description": "Analise os logs do sistema em busca de atividades suspeitas",
        "command": "sudo tail -f /var/log/auth.log",
        "expected_output": "Authentication logs displayed"
      }
    ]',
    'cybersecurity',
    'b1e2c3d4-5f6a-7b8c-9d0e-1f2a3b4c5d6e'
  ),
  (
    'm2b3c4d5-6e7f-8a9b-0c1d-2e3f4a5b6c7d',
    'Análise de Vulnerabilidades Web',
    'Identifique e explore vulnerabilidades comuns em aplicações web usando ferramentas especializadas.',
    'terminal',
    'advanced',
    150,
    'Identificar e analisar vulnerabilidades em aplicações web',
    'Esta missão ensina como identificar, analisar e explorar vulnerabilidades comuns em aplicações web, utilizando ferramentas como Nmap, Nikto e OWASP ZAP.',
    '[
      {
        "title": "Reconhecimento com Nmap",
        "description": "Escaneie portas e serviços do alvo",
        "command": "nmap -sV -sC target_ip",
        "expected_output": "Port scan results with service versions"
      },
      {
        "title": "Análise com Nikto",
        "description": "Execute scan de vulnerabilidades web",
        "command": "nikto -h http://target_ip",
        "expected_output": "Web vulnerability scan results"
      },
      {
        "title": "Teste de SQL Injection",
        "description": "Teste formulários para SQL Injection",
        "command": "sqlmap -u \"http://target_ip/login.php\" --forms",
        "expected_output": "SQL injection test results"
      },
      {
        "title": "Análise de cabeçalhos HTTP",
        "description": "Verifique cabeçalhos de segurança",
        "command": "curl -I http://target_ip",
        "expected_output": "HTTP headers displayed"
      },
      {
        "title": "Relatório de vulnerabilidades",
        "description": "Documente as vulnerabilidades encontradas",
        "command": "echo \"Vulnerability Report\" > report.txt",
        "expected_output": "Report file created"
      }
    ]',
    'cybersecurity',
    'b2f3a4b5-6c7d-8e9f-0a1b-2c3d4e5f6a7b'
  ),
  (
    'm3c4d5e6-7f8a-9b0c-1d2e-3f4a5b6c7d8e',
    'Forense Digital Básica',
    'Aprenda técnicas fundamentais de investigação forense digital para análise de evidências.',
    'terminal',
    'intermediate',
    120,
    'Realizar análise forense básica em evidências digitais',
    'Esta missão introduz conceitos e técnicas de forense digital, ensinando como preservar, analisar e extrair evidências de sistemas comprometidos.',
    '[
      {
        "title": "Criar imagem forense",
        "description": "Crie uma cópia bit-a-bit do disco",
        "command": "sudo dd if=/dev/sdb of=evidence.img bs=4096 conv=noerror,sync",
        "expected_output": "Disk image created successfully"
      },
      {
        "title": "Calcular hash da evidência",
        "description": "Gere hash MD5 e SHA256 para integridade",
        "command": "md5sum evidence.img && sha256sum evidence.img",
        "expected_output": "Hash values calculated"
      },
      {
        "title": "Montar imagem como somente leitura",
        "description": "Monte a imagem sem modificá-la",
        "command": "sudo mount -o ro,loop evidence.img /mnt/evidence",
        "expected_output": "Image mounted read-only"
      },
      {
        "title": "Análise de logs do sistema",
        "description": "Examine logs em busca de atividades suspeitas",
        "command": "sudo grep -i \"failed\\|error\\|warning\" /mnt/evidence/var/log/syslog",
        "expected_output": "Suspicious log entries found"
      },
      {
        "title": "Recuperar arquivos deletados",
        "description": "Use ferramentas para recuperar arquivos",
        "command": "sudo foremost -i evidence.img -o recovered/",
        "expected_output": "Deleted files recovered"
      }
    ]',
    'cybersecurity',
    'b3a4b5c6-7d8e-9f0a-1b2c-3d4e5f6a7b8c'
  ),
  (
    'm4d5e6f7-8a9b-0c1d-2e3f-4a5b6c7d8e9f',
    'Configuração de IDS/IPS',
    'Configure e gerencie sistemas de detecção e prevenção de intrusão para proteger a rede.',
    'terminal',
    'advanced',
    180,
    'Implementar e configurar sistemas IDS/IPS para monitoramento de rede',
    'Aprenda a configurar e gerenciar sistemas de detecção (IDS) e prevenção (IPS) de intrusão usando Suricata e Snort para proteger infraestruturas de rede.',
    '[
      {
        "title": "Instalar Suricata",
        "description": "Instale o sistema IDS/IPS Suricata",
        "command": "sudo apt install suricata -y",
        "expected_output": "Suricata installed successfully"
      },
      {
        "title": "Configurar interface de rede",
        "description": "Configure a interface para monitoramento",
        "command": "sudo nano /etc/suricata/suricata.yaml",
        "expected_output": "Configuration file opened"
      },
      {
        "title": "Atualizar regras",
        "description": "Baixe e atualize as regras de detecção",
        "command": "sudo suricata-update",
        "expected_output": "Rules updated successfully"
      },
      {
        "title": "Iniciar monitoramento",
        "description": "Inicie o Suricata em modo IDS",
        "command": "sudo suricata -c /etc/suricata/suricata.yaml -i eth0",
        "expected_output": "Suricata started monitoring"
      },
      {
        "title": "Analisar alertas",
        "description": "Examine os logs de alertas gerados",
        "command": "sudo tail -f /var/log/suricata/fast.log",
        "expected_output": "Security alerts displayed"
      }
    ]',
    'cybersecurity',
    'b4b5c6d7-8e9f-0a1b-2c3d-4e5f6a7b8c9d'
  ),
  (
    'm5e6f7a8-9b0c-1d2e-3f4a-5b6c7d8e9f0a',
    'CTF - Quebra de Senhas e Criptografia',
    'Participe de desafios CTF focados em quebra de senhas e análise criptográfica.',
    'terminal',
    'expert',
    200,
    'Resolver desafios de criptografia e quebra de senhas em ambiente CTF',
    'Esta missão apresenta desafios práticos de Capture The Flag (CTF) focados em criptografia, quebra de senhas e análise de algoritmos de cifragem.',
    '[
      {
        "title": "Quebrar hash MD5",
        "description": "Use John the Ripper para quebrar hash MD5",
        "command": "john --format=raw-md5 --wordlist=/usr/share/wordlists/rockyou.txt hash.txt",
        "expected_output": "Password cracked successfully"
      },
      {
        "title": "Análise de cifra César",
        "description": "Decodifique uma mensagem com cifra César",
        "command": "echo \"KHOOR ZRUOG\" | tr \"A-Z\" \"X-ZA-W\"",
        "expected_output": "HELLO WORLD"
      },
      {
        "title": "Quebrar criptografia RSA",
        "description": "Fatore números RSA pequenos",
        "command": "python3 -c \"import sympy; print(sympy.factorint(15))\"",
        "expected_output": "RSA factors found"
      },
      {
        "title": "Análise de frequência",
        "description": "Realize análise de frequência em texto cifrado",
        "command": "cat cipher.txt | tr -d \" \\n\" | fold -w1 | sort | uniq -c | sort -nr",
        "expected_output": "Character frequency analysis"
      },
      {
        "title": "Decodificar Base64",
        "description": "Decodifique mensagens em Base64",
        "command": "echo \"SGVsbG8gV29ybGQ=\" | base64 -d",
        "expected_output": "Hello World"
      }
    ]',
    'cybersecurity',
    'b5c6d7e8-9f0a-1b2c-3d4e-5f6a7b8c9d0e'
  ),
  (
    'm6f7a8b9-0c1d-2e3f-4a5b-6c7d8e9f0a1b',
    'Segurança de Containers Docker',
    'Aprenda a implementar práticas de segurança em containers Docker e Kubernetes.',
    'terminal',
    'advanced',
    160,
    'Implementar práticas de segurança em ambientes containerizados',
    'Esta missão ensina como proteger containers Docker e ambientes Kubernetes, implementando práticas de segurança desde a construção até o deployment.',
    '[
      {
        "title": "Escanear imagem Docker",
        "description": "Use Trivy para escanear vulnerabilidades",
        "command": "trivy image nginx:latest",
        "expected_output": "Vulnerability scan results"
      },
      {
        "title": "Criar usuário não-root",
        "description": "Configure container para executar como usuário não-root",
        "command": "docker run --user 1000:1000 nginx:latest",
        "expected_output": "Container running as non-root user"
      },
      {
        "title": "Configurar AppArmor",
        "description": "Aplique perfil de segurança AppArmor",
        "command": "docker run --security-opt apparmor=docker-default nginx:latest",
        "expected_output": "Container with AppArmor profile"
      },
      {
        "title": "Limitar recursos",
        "description": "Configure limites de CPU e memória",
        "command": "docker run --cpus=0.5 --memory=512m nginx:latest",
        "expected_output": "Container with resource limits"
      },
      {
        "title": "Verificar secrets",
        "description": "Escaneie por secrets em imagens",
        "command": "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --secret-config secret.yaml nginx:latest",
        "expected_output": "Secret scan completed"
      }
    ]',
    'cybersecurity',
    'b6d7e8f9-0a1b-2c3d-4e5f-6a7b8c
