import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("Memulai FitBite Backend Server (FastAPI)...")
    print("URL Server  : http://localhost:5000")
    print("Swagger Docs: http://localhost:5000/docs")
    print("=" * 60)
    uvicorn.run("app.main:app", host="127.0.0.1", port=5000, reload=True)

