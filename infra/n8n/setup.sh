#!/bin/bash
set -e

echo "=== CIM-RJ · Setup do n8n na VM (Google Cloud e2-micro) ==="

echo "[1/6] Atualizando pacotes..."
sudo apt-get update -y

echo "[2/6] Criando memória swap de 2GB (evita travamento por falta de RAM)..."
if [ ! -f /swapfile ]; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

echo "[3/6] Instalando Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker $USER
fi

echo "[4/6] Instalando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

echo "[5/6] Verificando arquivo .env..."
if [ ! -f .env ]; then
  echo "ERRO: arquivo .env não encontrado. Copie .env.example para .env e preencha antes de continuar."
  exit 1
fi

echo "[6/6] Subindo os containers..."
sudo docker-compose up -d

echo ""
echo "=== PRONTO ==="
echo "n8n disponível em: http://$(curl -s ifconfig.me):5678"
echo "Uptime Kuma (monitoramento) em: http://$(curl -s ifconfig.me):3001"
