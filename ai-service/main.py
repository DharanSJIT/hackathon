from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

class UserInput(BaseModel):
    student_class: int
    father_occupation: str
    marks: float

class ScholarshipData(BaseModel):
    id: str
    min_class: Optional[int] = None
    max_class: Optional[int] = None
    father_occupation_allowed: Optional[List[str]] = None
    min_marks_percentage: Optional[float] = None
    social_uplift_score: Optional[int] = 0

class MatchRequest(BaseModel):
    user_input: UserInput
    scholarships: List[ScholarshipData]

class MatchResult(BaseModel):
    scholarship_id: str
    score: float

@app.post("/match", response_model=List[MatchResult])
def match_scholarships(req: MatchRequest):
    results = []
    
    for sch in req.scholarships:
        score = 0.0
        
        # 1. Class Check (Strict or partial)
        if sch.min_class is not None and req.user_input.student_class < sch.min_class:
            continue # Ineligible
            
        if sch.max_class is not None and req.user_input.student_class > sch.max_class:
            continue # Ineligible
            
        score += 30 # Passed class check
        
        # 2. Occupation Check
        occ = req.user_input.father_occupation.lower().strip()
        if sch.father_occupation_allowed and len(sch.father_occupation_allowed) > 0:
            allowed = [o.lower().strip() for o in sch.father_occupation_allowed]
            if occ not in allowed and "any" not in allowed:
                # Penalty or ineligible? The prompt says "reduce points"
                score -= 10
            else:
                score += 30
        else:
            score += 30
            
        # 3. Marks Check
        if sch.min_marks_percentage is not None:
            if req.user_input.marks >= sch.min_marks_percentage:
                score += 40
            else:
                # Reduce points for lower marks
                score += max(0, 40 - (sch.min_marks_percentage - req.user_input.marks))
        else:
            score += 40
            
        # Normalize to 100
        score = min(100.0, score)
        
        # Add Social Uplift Score logic as a tie-breaker (handled by node usually, but we can do a minor bump)
        final_score = (score * 0.8) + ((sch.social_uplift_score or 0) * 0.2)
        
        results.append(MatchResult(scholarship_id=sch.id, score=final_score))
        
    # Sort descending
    results.sort(key=lambda x: x.score, reverse=True)
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
