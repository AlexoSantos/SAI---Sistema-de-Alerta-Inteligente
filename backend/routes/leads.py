from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db, Lead

router = APIRouter()

# Validação com Pydantic
class LeadCreate(BaseModel):
    nome: str
    email: str
    telefone: str
    cidade: str

@router.post("/api/leads")
def create_lead(lead: LeadCreate, db: Session = Depends(get_db)):
    """
    Salva o contato comercial no banco de dados Neon (Postgres).
    """
    try:
        new_lead = Lead(
            nome=lead.nome,
            email=lead.email,
            telefone=lead.telefone,
            cidade=lead.cidade
        )
        db.add(new_lead)
        db.commit()
        db.refresh(new_lead)
        return {"message": "Lead salvo com sucesso", "lead_id": new_lead.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao salvar lead: {str(e)}")
