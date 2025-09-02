# ============
# Cell 1: Setup
# ============
!pip -q install pydantic-ai openai python-dotenv

import os, textwrap, uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional

from pydantic_ai import Agent, RunContext
from pydantic_ai.settings import ModelSettings

# --- Configure your model (override via env if you like) ---
# Options include 'openai:gpt-4o', 'openai:gpt-4o-mini'
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "openai:gpt-4o")
# Make sure your OpenAI key is set in environment in Colab:
# os.environ["OPENAI_API_KEY"] = "sk-..."

# ===========
# Intake Data
# ===========
@dataclass
class IntakeState:
    patient_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    date: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    consent: Optional[str] = None
    chief_complaint: Dict[str, Optional[str]] = field(default_factory=lambda: {
        "presenting_issue": None,
        "onset": None,
        "impact": None,
    })

    hpi: Dict[str, Optional[str]] = field(default_factory=lambda: {
        "onset": None, "duration": None, "frequency": None,
        "sleep": None, "appetite": None, "energy": None,
        "concentration": None, "mood": None, "motivation": None,
        "psychosis": None
    })

    safety: Dict[str, Optional[str]] = field(default_factory=lambda: {
        "self_harm": None, "harm_others": None, "environment_safe": None, "notes": None,
        "risk_level": "Low"
    })

    psychiatric_history: Dict[str, Optional[str]] = field(default_factory=lambda: {
        "prior_diagnoses": None, "hospitalizations": None, "therapy": None
    })

    medication_history: Dict[str, Optional[str]] = field(default_factory=lambda: {
        "current": None, "effectiveness": None, "side_effects": None,
        "adherence": None, "past_psych_meds": None
    })

    medical_history: Dict[str, Optional[str]] = field(default_factory=lambda: {
        "chronic_conditions": None, "seizures_head_injury": None, "major_illnesses": None
    })

    substance_use: Dict[str, Optional[str]] = field(default_factory=lambda: {
        "alcohol": None, "tobacco": None, "cannabis": None, "stimulants": None,
        "opioids": None, "prescription_misuse": None, "other": None
    })

    family_history: Dict[str, Optional[str]] = field(default_factory=lambda: {
        "psychiatric": None, "suicide": None, "substance_use": None, "major_medical": None
    })

    social_history: Dict[str, Optional[str]] = field(default_factory=lambda: {
        "living": None, "work_school": None, "relationships": None, "trauma": None, "legal": None
    })

    protective_factors: Dict[str, Optional[str]] = field(default_factory=lambda: {
        "supports": None, "coping": None, "goals": None
    })

    # Screeners: store answers and scores
    screeners: Dict[str, Dict] = field(default_factory=lambda: {
        "PHQ-9": {"answers": {}, "score": None},
        "GAD-7": {"answers": {}, "score": None},
        "AUDIT-C": {"answers": {}, "score": None},
        "ASRS_A": {"answers": {}, "score": None},
        "PCL-5": {"answers": {}, "score": None},
        "MDQ": {"answers": {}, "score": None},
        "DAST-10": {"answers": {}, "score": None},
    })

# ===========
# Screeners DB
# ===========
# Each screener defines: items (dict index->text), options (label->score), and scoring notes.
PHQ9_ITEMS = {
    1:"Little interest or pleasure in doing things",
    2:"Feeling down, depressed, or hopeless",
    3:"Trouble falling or staying asleep, or sleeping too much",
    4:"Feeling tired or having little energy",
    5:"Poor appetite or overeating",
    6:"Feeling bad about yourself—or that you are a failure or have let yourself or your family down",
    7:"Trouble concentrating on things, such as reading the newspaper or watching television",
    8:"Moving or speaking so slowly that other people could have noticed? Or the opposite—being so fidgety or restless that you have been moving around a lot more than usual",
    9:"Thoughts that you would be better off dead, or of hurting yourself"
}
PHQ9_OPTIONS = {"0 = Not at all":0,"1 = Several days":1,"2 = More than half the days":2,"3 = Nearly every day":3}

GAD7_ITEMS = {
    1:"Feeling nervous, anxious, or on edge",
    2:"Not being able to stop or control worrying",
    3:"Worrying too much about different things",
    4:"Trouble relaxing",
    5:"Being so restless that it is hard to sit still",
    6:"Becoming easily annoyed or irritable",
    7:"Feeling afraid as if something awful might happen"
}
GAD7_OPTIONS = PHQ9_OPTIONS

AUDITC_ITEMS = {
    1:"How often do you have a drink containing alcohol?",
    2:"How many standard drinks containing alcohol do you have on a typical day?",
    3:"How often do you have six or more drinks on one occasion?"
}
# Standard AUDIT-C scoring maps
AUDITC_OPTIONS = {
    1: {"Never":0,"Monthly or less":1,"2–4 times a month":2,"2–3 times a week":3,"4+ times a week":4},
    2: {"1–2":0,"3–4":1,"5–6":2,"7–9":3,"10+":4},
    3: {"Never":0,"Less than monthly":1,"Monthly":2,"Weekly":3,"Daily or almost daily":4}
}

ASRS_A_ITEMS = {
    1:"How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?",
    2:"How often do you have difficulty getting things in order when you have to do a task that requires organization?",
    3:"How often do you have problems remembering appointments or obligations
