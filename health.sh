# Create this as a script file: health_check.sh
#!/bin/bash

echo "🏥 TivraMedi Application Health Check"
echo "====================================="

# Container Status
echo -e "\n📦 Container Status:"
docker-compose ps

# PostgreSQL
echo -e "\n🗄️  PostgreSQL:"
docker exec tivramedi-postgres pg_isready -U postgres -d tivramedi && echo "✅ Database Ready" || echo "❌ Database Failed"

# Ollama
echo -e "\n🤖 Ollama AI Service:"
curl -s http://localhost:11434/api/tags >/dev/null && echo "✅ Ollama Ready" || echo "❌ Ollama Failed"

# Backend
echo -e "\n⚙️  Backend API:"
curl -s http://localhost:8080/health >/dev/null && echo "✅ Backend Ready" || echo "❌ Backend Failed"

# Triage
echo -e "\n🩺 Triage Service:"
curl -s http://localhost:8000/health >/dev/null && echo "✅ Triage Ready" || echo "❌ Triage Failed"

# Frontend
echo -e "\n🌐 Frontend:"
curl -s -I http://localhost:3000 >/dev/null && echo "✅ Frontend Ready" || echo "❌ Frontend Failed"

echo -e "\n🎉 Health Check Complete!"
