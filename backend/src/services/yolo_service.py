import sys
import json
import os
import contextlib
from io import StringIO

# Suppress ultralytics logging before importing
os.environ["YOLO_VERBOSE"] = "False"

from ultralytics import YOLO

def detect_objects(image_source, model_url, conf=0.25):
    # Capture/suppress stdout during model loading and prediction
    # to avoid "Found ... locally" messages breaking JSON output
    with contextlib.redirect_stdout(StringIO()):
        try:
            # Load the model
            model = YOLO(model_url)
            
            # Run prediction
            results = model.predict(source=image_source, conf=conf, verbose=False)
            
            detections = []
            if len(results) > 0:
                result = results[0]
                boxes = result.boxes
                
                for box in boxes:
                    r = box.xyxy[0].tolist()
                    label_id = int(box.cls[0])
                    label = result.names[label_id]
                    confidence = float(box.conf[0])
                    
                    detections.append({
                        "label": label,
                        "confidence": confidence,
                        "bbox": [r[0], r[1], r[2] - r[0], r[3] - r[1]] # [x, y, w, h]
                    })
            
            return {"objects": detections, "model": model_url}

        except Exception as e:
            return {"error": str(e), "objects": []}

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: yolo_service.py <image_source> <model_url> [conf]"}))
        sys.exit(1)

    image_source = sys.argv[1]
    model_url = sys.argv[2]
    conf = float(sys.argv[3]) if len(sys.argv) > 3 else 0.25

    result = detect_objects(image_source, model_url, conf)
    print(json.dumps(result))
