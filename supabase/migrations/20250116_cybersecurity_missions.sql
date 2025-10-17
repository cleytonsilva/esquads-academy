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
    'Nesta missão, você irá aprender e aplicar técnicas fundamentais de hardening em servidores Linux.',
    '[{"title": "Atualizar o sistema", "description": "Mantenha o sistema sempre atualizado", "command": "sudo apt update && sudo apt upgrade -y", "expected_output": "Packages updated successfully"}]',
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
    'Esta missão ensina como identificar, analisar e explorar vulnerabilidades comuns em aplicações web.',
    '[{"title": "Reconhecimento com Nmap", "description": "Escaneie portas e serviços do alvo", "command": "nmap -sV -sC target_ip", "expected_output": "Port scan results"}]',
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
    'Esta missão introduz conceitos e técnicas de forense digital.',
    '[{"title": "Criar imagem forense", "description": "Crie uma cópia bit-a-bit do disco", "command": "sudo dd if=/dev/sdb of=evidence.img", "expected_output": "Disk image created"}]',
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
    'Aprenda a configurar e gerenciar sistemas de detecção e prevenção de intrusão.',
    '[{"title": "Instalar Suricata", "description": "Instale o sistema IDS/IPS Suricata", "command": "sudo apt install suricata -y", "expected_output": "Suricata installed"}]',
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
    'Esta missão apresenta desafios práticos de Capture The Flag focados em criptografia.',
    '[{"title": "Quebrar hash MD5", "description": "Use John the Ripper para quebrar hash MD5", "command": "john --format=raw-md5 hash.txt", "expected_output": "Password cracked"}]',
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
    'Esta missão ensina como proteger containers Docker e ambientes Kubernetes.',
    '[{"title": "Escanear imagem Docker", "description": "Use Trivy para escanear vulnerabilidades", "command": "trivy image nginx:latest", "expected_output": "Vulnerability scan results"}]',
    'cybersecurity',
    'b6d7e8f9-0a1b-2c3d-4e5f-6a7b8c9d0e1f'
  )