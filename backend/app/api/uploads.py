from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List
import shutil
import os
import uuid
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = "uploads/general"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/file")
async def upload_file(
    file: UploadFile = File(...),
    current_user = Depends(get_current_active_user)
):
    try:
        file_ext = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {
            "url": f"/static/general/{unique_filename}",
            "filename": file.filename,
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
