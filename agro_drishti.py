"""AgroDrishti - AI-Powered Crop Disease Detection with Biological Solutions.

Entrypoint / alias script delegating to the unified app.py.
Both `streamlit run app.py` and `streamlit run agro_drishti.py` are fully supported.
"""

from pathlib import Path
import runpy

target_script = Path(__file__).resolve().parent / "app.py"
runpy.run_path(str(target_script), run_name="__main__")
