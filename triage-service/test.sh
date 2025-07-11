curl -X POST http://localhost:8000/triage -H "Content-Type: application/json" -d '{
  "text": "chest pain in left chest since 6 hours"
}'

# curl -X POST http://localhost:8080/triage -H "Content-Type: application/json" -d '{
#   "text": "headache"
# }'



# curl -X POST http://localhost:11434/api/generate -d '{
#   "model": "deepseek-r1:1.5b",
#   "prompt": "Hello"
# }'