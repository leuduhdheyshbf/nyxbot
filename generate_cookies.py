import os
import subprocess

COOKIES_FILE = "cookies.txt"

def generate_cookies():
    print("🔄 Gerando novos cookies do YouTube...")

    # Comando que simula um navegador real e gera cookies válidos
    cmd = [
        "./yt-dlp",
        "--cookies", COOKIES_FILE,
        "--no-playlist",
        "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "--extractor-args", "youtube:player_client=android",
        "--simulate",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    ]

    try:
        subprocess.run(cmd, check=True, timeout=30)
        print("✅ Cookies gerados com sucesso!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao gerar cookies: {e}")
        return False

if __name__ == "__main__":
    generate_cookies()
