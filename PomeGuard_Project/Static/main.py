import uvicorn
from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from inference_sdk import InferenceHTTPClient
import mysql.connector
import traceback
import shutil
import os
from datetime import datetime, timedelta
from passlib.context import CryptContext  
from jose import JWTError, jwt
from pydantic import BaseModel  

# =========================================
# 1. SECURITY & CONFIGURATION
# =========================================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "YOUR_SUPER_SECRET_KEY_GOES_HERE" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 

# --- Database Config ---
MYSQL_HOST = "localhost"
MYSQL_USER = "root"
MYSQL_PASSWORD = "" 
MYSQL_DB = "pomeguard_db" 

# --- Roboflow Inference Client Config ---
CLIENT = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="woRNY6yEnAkZOoHbiCLN"
)
MODEL_ID = "pomeguard-master/2"

# =========================================
# 2. PYDANTIC SCHEMAS FOR VALIDATION
# =========================================
class UserRegister(BaseModel):
    username: str
    email: str
    phone_number: str
    password: str

class ContactInquiry(BaseModel):
    name: str
    email: str
    message: str

# =========================================
# 3. DATABASE HELPER FUNCTIONS
# =========================================
def get_disease_solution(disease_name):
    try:
        conn = mysql.connector.connect(host=MYSQL_HOST, user=MYSQL_USER, password=MYSQL_PASSWORD, database=MYSQL_DB)
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM diseases WHERE disease_name = %s"
        cursor.execute(query, (disease_name,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return result
    except Exception as e:
        print(f"Database Error (get_disease_solution): {e}")
        return None

def get_user(username: str):
    try:
        conn = mysql.connector.connect(host=MYSQL_HOST, user=MYSQL_USER, password=MYSQL_PASSWORD, database=MYSQL_DB)
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM users WHERE username = %s OR phone_number = %s"
        cursor.execute(query, (username, username))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        return user
    except Exception as e:
        print(f"Database Error (get_user): {e}")
        return None

def create_db_user(username: str, email: str, phone: str, hashed_password: str):
    try:
        conn = mysql.connector.connect(host=MYSQL_HOST, user=MYSQL_USER, password=MYSQL_PASSWORD, database=MYSQL_DB)
        cursor = conn.cursor()
        query = "INSERT INTO users (username, email, phone_number, password_hash) VALUES (%s, %s, %s, %s)"
        cursor.execute(query, (username, email, phone, hashed_password))
        conn.commit()
        cursor.close()
        conn.close()
        return {"success": True}
    except mysql.connector.Error as err:
        print(f"\n❌ CRITICAL DATABASE REGISTRATION ERROR: {err}\n")
        return {"success": False, "error_msg": str(err)}

def save_prediction(user_id: int, disease_id: int, confidence: float):
    try:
        conn = mysql.connector.connect(host=MYSQL_HOST, user=MYSQL_USER, password=MYSQL_PASSWORD, database=MYSQL_DB)
        cursor = conn.cursor()
        
        try:
            query = "INSERT INTO scan_history (user_id, disease_id, image_path, confidence, scan_date) VALUES (%s, %s, %s, %s, NOW())"
            cursor.execute(query, (int(user_id), int(disease_id), "webcam_capture", float(confidence)))
        except mysql.connector.Error:
            query = "INSERT INTO scan_history (user_id, disease_id, image_path, confidence) VALUES (%s, %s, %s, %s)"
            cursor.execute(query, (int(user_id), int(disease_id), "webcam_capture", float(confidence)))
            
        conn.commit()
        cursor.close()
        conn.close()
        print(f"📡 API TELEMETRY LOGGED SUCCESFULLY FOR USER_ID: {user_id}")
        return True
    except Exception as e:
        print(f"❌ Structural database operation crash stack trace output properties:")
        traceback.print_exc()
        return False

# =========================================
# 4. AUTHENTICATION HELPERS
# =========================================
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
            
        user = get_user(username)
        if user is None:
            raise credentials_exception
            
        if "user_id" not in user and "id" in user:
            user["user_id"] = user["id"]
            
        return user
    except JWTError:
        raise credentials_exception

# =========================================
# 5. FASTAPI APP & ENDPOINTS
# =========================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# --- REGISTER ---
@app.post("/register")
async def register(user_data: UserRegister):
    check_user = get_user(user_data.username)
    if check_user:
        raise HTTPException(status_code=400, detail="Username or phone number already registered")
        
    hashed_pass = get_password_hash(user_data.password)
    result = create_db_user(user_data.username, user_data.email, user_data.phone_number, hashed_pass)
    
    if not result["success"]:
        raise HTTPException(
            status_code=500, 
            detail=f"Registration failed: {result.get('error_msg')}"
        )
        
    return {"status": "success", "message": "User registered successfully"}

# --- LOGIN ---
@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user(form_data.username)
    if not user or not verify_password(form_data.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Incorrect username, phone number, or password")
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    u_id = user.get('user_id') or user.get('id')
    access_token = create_access_token(
        data={"sub": user['username'], "user_id": u_id}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- USER PROFILE & SCAN HISTORY ---
@app.get("/user/profile")
async def get_user_profile_and_history(current_user: dict = Depends(get_current_user)):
    try:
        conn = mysql.connector.connect(host=MYSQL_HOST, user=MYSQL_USER, password=MYSQL_PASSWORD, database=MYSQL_DB)
        cursor = conn.cursor(dictionary=True)
        
        u_id = current_user.get('user_id') or current_user.get('id')
        user_query = "SELECT username, email, phone_number FROM users WHERE user_id = %s"
        cursor.execute(user_query, (u_id,))
        db_user = cursor.fetchone()
        
        user_profile = {
            "username": db_user["username"] if db_user else current_user["username"],
            "email": db_user["email"] if db_user and db_user["email"] else "-",
            "phone_number": db_user["phone_number"] if db_user and db_user["phone_number"] else "-"
        }

        sanitized_history = []
        try:
            cursor.execute("SHOW COLUMNS FROM scan_history")
            columns = [col['Field'] for col in cursor.fetchall()]
            
            sort_column = "id"
            if "scan_id" in columns:
                sort_column = "scan_id"
            elif "history_id" in columns:
                sort_column = "history_id"
            
            history_query = f"""
                SELECT confidence, disease_id, 
                       {sort_column} as scan_id,
                       ROW_NUMBER() OVER (ORDER BY {sort_column} DESC) as fallback_id
                FROM scan_history 
                WHERE user_id = %s 
                ORDER BY {sort_column} DESC
            """
            cursor.execute(history_query, (u_id,))
            history_records = cursor.fetchall()
            
            for row in history_records:
                s_id = row.get('scan_id') or row.get('fallback_id')
                row['scan_date'] = str(datetime.now().date())
                
                if row['disease_id'] == 1:
                    row['disease_name'] = "Bacterial Blight"
                elif row['disease_id'] == 2:
                    row['disease_name'] = "Anthracnose"
                elif row['disease_id'] == 3:
                    row['disease_name'] = "Alternaria"
                elif row['disease_id'] == 4:
                    row['disease_name'] = "Cercospora"
                elif row['disease_id'] == 5:
                    row['disease_name'] = "Healthy"
                else:
                    row['disease_name'] = f"Scan #{row['disease_id']}"
                
                raw_conf = row.get('confidence', 0.0)
                if raw_conf > 1.0:
                    raw_conf = raw_conf / 100.0
                row['confidence'] = float(raw_conf)
                
                row['scan_id'] = s_id
                sanitized_history.append(row)
                    
        except mysql.connector.Error as db_err:
            print(f"⚠️ Scan History Table Mapping Conflict: {db_err}")
            sanitized_history = []

        cursor.close()
        conn.close()
        return {"user": user_profile, "history": sanitized_history}
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database execution breakdown: {str(e)}")

# --- DELETE SCAN RECORD ---
@app.delete("/history/delete/{scan_id}")
async def delete_scan_record(scan_id: int, current_user: dict = Depends(get_current_user)):
    try:
        conn = mysql.connector.connect(host=MYSQL_HOST, user=MYSQL_USER, password=MYSQL_PASSWORD, database=MYSQL_DB)
        cursor = conn.cursor()
        
        u_id = current_user.get('user_id') or current_user.get('id')
        
        cursor.execute("SHOW COLUMNS FROM scan_history")
        columns = [col[0] for col in cursor.fetchall()]
        
        sort_column = "id"
        if "scan_id" in columns:
            sort_column = "scan_id"
        elif "history_id" in columns:
            sort_column = "history_id"

        delete_query = f"DELETE FROM scan_history WHERE {sort_column} = %s AND user_id = %s"
        cursor.execute(delete_query, (scan_id, u_id))
        conn.commit()
        
        affected = cursor.rowcount
        cursor.close()
        conn.close()
        
        if affected == 0:
            raise HTTPException(status_code=404, detail="Record not found or access restricted.")
            
        return {"status": "success", "message": "Record deleted from field ledger successfully."}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database transaction failure: {str(e)}")

# --- PREDICT ENGINE ---
@app.post("/predict")
async def predict(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = CLIENT.infer(temp_path, model_id=MODEL_ID)
        if os.path.exists(temp_path):
            os.remove(temp_path)

        predictions = result.get('predictions', [])
        if not predictions:
             return {"status": "error", "message": "AI could not recognize the image."}

        top_result = predictions[0]
        predicted_class = top_result['class']
        confidence = top_result['confidence']

        if predicted_class == "Not_Pomegranate":
            return {"status": "warning", "message": "No pomegranate detected."}

        solution_info = get_disease_solution(predicted_class)
        
        target_disease_id = 5
        display_name = "Healthy"
        desc, org_sol, chem_sol = "Healthy sample.", "Orchard protocol.", "Monitor crop."

        if solution_info:
            target_disease_id = solution_info['disease_id']
            display_name = solution_info['disease_name']
            desc = solution_info['description']
            org_sol = solution_info['organic_sol']
            chem_sol = solution_info['chemical_sol']
        else:
            cleaned_label = str(predicted_class).lower().replace(" ", "_")
            if "bacterial" in cleaned_label:
                target_disease_id = 1
                display_name = "Bacterial Blight"
            elif "anthracnose" in cleaned_label:
                target_disease_id = 2
                display_name = "Anthracnose"
            elif "alternaria" in cleaned_label:
                target_disease_id = 3
                display_name = "Alternaria"
            elif "cercospora" in cleaned_label:
                target_disease_id = 4
                display_name = "Cercospora"

        u_id = current_user.get('user_id') or current_user.get('id')
        save_prediction(u_id, target_disease_id, confidence)

        return {
            "status": "success", "disease": display_name, "confidence": f"{confidence * 100:.2f}%",
            "description": desc, "solution_organic": org_sol, "solution_chemical": chem_sol
        }
    except Exception as e:
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

# --- CONTACT SUPPORT ENDPOINT ---
@app.post("/contact")
async def save_contact_message(inquiry: ContactInquiry):
    try:
        conn = mysql.connector.connect(host=MYSQL_HOST, user=MYSQL_USER, password=MYSQL_PASSWORD, database=MYSQL_DB)
        cursor = conn.cursor()
        
        query = "INSERT INTO contact_messages (name, email, message) VALUES (%s, %s, %s)"
        cursor.execute(query, (inquiry.name, inquiry.email, inquiry.message))
        conn.commit()
        
        cursor.close()
        conn.close()
        return {"status": "success", "message": "Inquiry successfully recorded in secure support log tables."}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database logging operational failure: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)