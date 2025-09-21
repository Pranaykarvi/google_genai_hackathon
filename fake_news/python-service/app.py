from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import re
import os

app = Flask(__name__)
CORS(app)

# Load models at startup
print("🔄 Loading AI models...")

try:
    # Load your working model files
    with open('models/best_fake_news_model.pkl', 'rb') as f:
        model = pickle.load(f)
    print("✅ Model loaded successfully!")
    
    with open('models/vectorizer.pkl', 'rb') as f:
        vectorizer = pickle.load(f)
    print("✅ Vectorizer loaded successfully!")
    
    models_loaded = True
    print(f"🤖 Model type: {type(model)}")
    print(f"🔧 Vectorizer type: {type(vectorizer)}")
    
except Exception as e:
    print(f"❌ Error loading models: {e}")
    model = None
    vectorizer = None
    models_loaded = False

def preprocess_text(text):
    """Preprocess text for prediction"""
    if not text:
        return ""
    
    text = str(text).lower()
    text = re.sub(r'http[s]?://\S+', '', text)
    text = re.sub(r'www\.\S+', '', text)
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "models_loaded": models_loaded,
        "model_available": model is not None,
        "vectorizer_available": vectorizer is not None,
        "model_type": str(type(model)) if model else None,
        "vectorizer_type": str(type(vectorizer)) if vectorizer else None
    })

@app.route('/predict', methods=['POST'])
def predict_single():
    """Predict single article"""
    try:
        if not models_loaded:
            return jsonify({
                "success": False,
                "error": "Models not loaded"
            })
        
        data = request.get_json()
        text = data.get('text', '')
        
        # Preprocess
        processed = preprocess_text(text)
        
        if not processed:
            return jsonify({
                "success": True,
                "prediction": "uncertain",
                "confidence": 0.5
            })
        
        # Make prediction
        text_vector = vectorizer.transform([processed])
        prediction = model.predict(text_vector)[0]
        probabilities = model.predict_proba(text_vector)[0]
        
        return jsonify({
            "success": True,
            "prediction": "real" if prediction == 1 else "fake",
            "confidence": float(max(probabilities)),
            "confidence_score": float(max(probabilities)) * 100,
            "probabilities": {
                "fake": float(probabilities[0]),
                "real": float(probabilities[1])
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/predict-batch', methods=['POST'])
def predict_batch():
    """Predict multiple articles"""
    try:
        if not models_loaded:
            return jsonify({
                "success": False,
                "error": "Models not loaded",
                "predictions": []
            })
        
        data = request.get_json()
        articles = data.get('articles', [])
        results = []
        
        print(f"🔄 Processing {len(articles)} articles...")
        
        for i, article in enumerate(articles):
            try:
                # Extract text
                title = article.get('title', '')
                body = article.get('text_body', '')
                description = article.get('description', '')
                full_text = f"{title} {body} {description}".strip()
                
                # Preprocess
                processed_text = preprocess_text(full_text)
                
                if len(processed_text.split()) < 2:
                    # Not enough text
                    result = {
                        "article_id": article.get('article_id', f'article_{i}'),
                        "prediction": "uncertain",
                        "confidence": 0.5,
                        "confidence_score": 50.0,
                        "reason": "insufficient_text"
                    }
                else:
                    # Make prediction
                    text_vector = vectorizer.transform([processed_text])
                    prediction = model.predict(text_vector)[0]
                    probabilities = model.predict_proba(text_vector)[0]
                    
                    is_real = (prediction == 1)
                    confidence = float(max(probabilities))
                    
                    result = {
                        "article_id": article.get('article_id', f'article_{i}'),
                        "prediction": "real" if is_real else "fake",
                        "confidence": round(confidence, 3),
                        "confidence_score": round(confidence * 100, 1),
                        "probabilities": {
                            "fake": round(float(probabilities[0]), 3),
                            "real": round(float(probabilities[1]), 3)
                        }
                    }
                
                results.append(result)
                print(f"   Article {i+1}: {result['prediction']} ({result['confidence_score']}%)")
                
            except Exception as e:
                print(f"   Article {i+1}: Error - {e}")
                results.append({
                    "article_id": article.get('article_id', f'article_{i}'),
                    "prediction": "error",
                    "confidence": 0.0,
                    "error": str(e)
                })
        
        print(f"✅ Completed processing {len(results)} articles")
        
        return jsonify({
            "success": True,
            "predictions": results,
            "total_processed": len(results)
        })
        
    except Exception as e:
        print(f"❌ Batch prediction error: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "predictions": []
        }), 500

@app.route('/test', methods=['GET'])
def test_prediction():
    """Test endpoint with sample data"""
    if not models_loaded:
        return jsonify({
            "error": "Models not loaded"
        })
    
    # Test with sample texts
    test_samples = [
        "Scientists publish peer-reviewed research on climate change",
        "BREAKING: Aliens secretly control government with mind rays"
    ]
    
    results = []
    for text in test_samples:
        processed = preprocess_text(text)
        text_vector = vectorizer.transform([processed])
        prediction = model.predict(text_vector)[0]
        probabilities = model.predict_proba(text_vector)[0]
        
        results.append({
            "text": text,
            "prediction": "real" if prediction == 1 else "fake",
            "confidence": round(float(max(probabilities)) * 100, 1),
            "probabilities": {
                "fake": round(float(probabilities[0]), 3),
                "real": round(float(probabilities[1]), 3)
            }
        })
    
    return jsonify({
        "test_results": results,
        "model_working": True
    })

if __name__ == '__main__':
    if models_loaded:
        print("🎉 AI service ready!")
        print("🔗 Available endpoints:")
        print("   GET  /health - Health check")
        print("   POST /predict - Single prediction")
        print("   POST /predict-batch - Batch prediction")
        print("   GET  /test - Test with sample data")
    else:
        print("❌ Models not loaded - service will have limited functionality")
    
    port = int(os.environ.get('PORT', 8080))
    print(f"🚀 Starting server on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)