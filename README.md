# MCDA (Multi-Criteria Decision Analysis)

College Project

## Description
Project implements Multi-Criteria Decision Analysis (MCDA) methods for decision making. The project contains the following methods:
- AHP (Analytic Hierarchy Process)
- TOPSIS (Technique for Order Preference by Similarity to Ideal Solution)
- PROMETHEE (Preference Ranking Organization Method for Enrichment Evaluations)
- WSM (Weighted Sum Model)

## Installation backend (Django)

### For MacOS and Linux
1. **Create and Activate Virtual Environment:** 

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```
For exit virtual environment use `deactivate`
2. **Install Python Dependencies:**
```bash
cd backend
pip3 install -r requirements.txt
python3 manage.py makemigrations
python3 manage.py migrate
```
3. **Start backend server:** 
```bash
python3 manage.py runserver
```

### For Windows
1. **Create and Activate Virtual Environment:** 
```diff
- RUN POWERSHELL AS ADMINISTRATOR
```
```bash
cd backend
python -m venv venv
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
.\venv\Scripts\activate
```
For exit virtual environment use `deactivate`
2. **Install Python Dependencies:**
```bash
cd backend
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
```
3. **Start backend server:** 
```bash
python manage.py runserver
```

## Installation frontend (Angular)
1. **Install Angular Dependencies:**
Before installing dependencies remove existing modules and than reinstall them. 
If you already had npm installed first run this command: `rm -rf node_modules`
```bash
npm i
```
After that use this code, to automaticly upgrade / fix vulnerabilities in npm packages
```bash
npm audit fix
```
2. **Start angular server:**
```bash
cd frontend
ng s -o
```

## Start both frontend and backend with one command
First add permission to execute the script
```bash
chmod +x start.sh
./start.sh
```

## Access the Application
   - Frontend Angular: `http://localhost:4200`
   - Backend Django: `http://localhost:8000`

## After installation run tests
1. **Run tests:**
```bash
python3 tests.py
```

2. **Run angular test:**
```bash
ng test
```