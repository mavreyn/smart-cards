from flask import Flask, request, jsonify
import joblib  # Assuming the model is saved with joblib
import numpy as np
import pandas as pd
import re 
from string import punctuation
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import CountVectorizer




# Check if stopwords are downloaded; if not, download them
def ensure_stopwords_downloaded():
    try:
        # Check if the stopwords corpus is already available
        nltk.data.find('corpora/stopwords')
    except LookupError:
        # If not found, download the stopwords corpus
        nltk.download('stopwords')
def ensure_punkt_downloaded():
    try:
        # Check if the stopwords corpus is already available
        nltk.data.find('tokenizers/punkt)tab')
    except LookupError:
        # If not found, download the stopwords corpus
        nltk.download('punkt_tab')
ensure_stopwords_downloaded()
ensure_punkt_downloaded()

stop_words = set(stopwords.words('english'))
app = Flask(__name__)

model = joblib.load('nbComplement_83Percent_modelv2.pkl')
vectorizer = joblib.load('vectorizer.pkl')


# Preprocessing function
def preprocess_text(text):
    # Remove numbers
    text = re.sub(r'\d+', '', text)
    # Remove punctuation
    text = ''.join([char for char in text if char not in punctuation])
    # Tokenize, remove stopwords
    text = ' '.join([word for word in word_tokenize(text) if word.lower() not in stop_words])
    return text

@app.route('/autocategorize', methods=['POST'])
def categorize_items():
    data = request.json
    items = data.get('items')
    features = [item['name'] for item in items] 

    # convert to dataframe, remove numbers, punctuation, and stopwords
    features_df = pd.DataFrame(features, columns=['name'])
    features_df['name'] = features_df['name'].apply(preprocess_text)
    
    x = features_df['name']
    x_vec = vectorizer.transform(x)
    # predict the category with the model
    predictions = model.predict(x_vec)
    
    for item, category in zip(items, predictions):
        item['category'] = category  # Add the predicted category
    # convert features to json and return 
    return jsonify(items)

    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001,debug=False)