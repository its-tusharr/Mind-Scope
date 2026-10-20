# Mind-Scope - Digital Habits & Wellbeing Insights
Mental Health Score Predictor
Mind-Scope is a machine learning-powered web application designed to explore the relationship between digital habits and mental well-being. It uses a trained machine learning model to generate a predicted mental health score based on user-provided inputs.

## 🌐 Live Demo

- **Live Application:** https://mind-scope-1.onrender.com

## ✨ Features

- Predicts a mental health score using a trained machine learning model.
- Provides a web interface for user interaction.
- Uses FastAPI to expose the prediction model through an API.
- Connects a frontend built with HTML, CSS, and JavaScript to the backend.
- Deploys the application using Render.

## 🛠️ Tech Stack

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Python | Backend development and machine learning |
| Pandas & NumPy | Data manipulation and numerical operations |
| Scikit-learn | Machine learning algorithms, preprocessing, and pipelines |
| Random Forest / Other trained estimator | Prediction model — list the exact algorithm used in your notebook |
| StandardScaler | Feature scaling |
| OneHotEncoder | Encoding categorical features |
| OrdinalEncoder | Encoding ordinal/categorical features |
| ColumnTransformer | Applying preprocessing to different feature columns |
| Pipeline | Combining preprocessing and model steps |
| Joblib | Saving and loading the trained ML model |
| FastAPI | Building REST API endpoints |
| Pydantic | Request schema definition and input data validation |
| Uvicorn | Running the FastAPI application |
| HTML, CSS & JavaScript | Frontend development |
| Git & GitHub | Version control and source code hosting |
| Render | Deployment |


## 🤖 Machine Learning Workflow

- Performed data preparation and preprocessing using Pandas and Scikit-learn.
- Applied feature transformation using `StandardScaler`, `OneHotEncoder`, and `OrdinalEncoder`, where applicable.
- Combined preprocessing steps using `ColumnTransformer` and `Pipeline` for an organized machine learning workflow.
- Saved and loaded the trained machine learning model using `Joblib`.
- Developed REST API endpoints using FastAPI to serve model predictions.
- Implemented request schema validation and input data validation using Pydantic.

## ⚙️ Project Architecture

1. **User Input:** The user enters the required information through the web interface.
2. **Frontend:** HTML, CSS, and JavaScript handle the interface and send a request to the backend.
3. **Backend API:** FastAPI receives the request and passes the input to the trained model.
4. **ML Prediction:** The saved model processes the input and generates a prediction.
5. **Output:** The predicted score is returned to the frontend for display.

## 📁 Project Structure

```text
Mind-Scope/
├── main.py
├── ML.ipynb
├── Mental_Health_Model.pkl
├── Student_Social_Media_And_Mental_Health_Impact.csv
├── index.html
├── style.css
├── script.js
├── requirement.txt
├── .python-version
├── .gitignore
└── README.md
```

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/its-tusharr/Mind-Scope.git
cd Mind-Scope
```

### 2. Create and activate a virtual environment

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
pip install -r requirement.txt
```

### 4. Start the FastAPI backend

```bash
uvicorn main:app --reload
```

### 5. Open the API documentation

Visit:

http://127.0.0.1:8000/docs

The frontend should be served through the configured frontend server, with its API URL pointing to the local backend.

## 📊 Dataset

The project includes a dataset named `Student_Social_Media_And_Mental_Health_Impact.csv`, used for the machine learning workflow.

## ⚠️ Disclaimer

Mind-Scope is an educational machine learning project. Its predictions are estimates based on the model and its training data. They are not a clinical diagnosis or a substitute for professional mental health advice.

## 👨‍💻 Author

**Tushar Verma**

- GitHub: https://github.com/its-tusharr

---

⭐ If you find this project interesting, feel free to explore the repository!
