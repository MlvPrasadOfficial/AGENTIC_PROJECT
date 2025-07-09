@echo off
REM Start both frontend and backend servers

echo Starting backend server...
start powershell -NoExit -Command "cd ../backend && python -m uvicorn main:app --reload --port 8000"

echo Starting frontend server...
start powershell -NoExit -Command "cd ../frontend && npm run dev"

echo Both servers started. Frontend at http://localhost:3000 and backend at http://localhost:8000
