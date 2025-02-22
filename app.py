from flask import Flask, request, jsonify
import json
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
import requests
from datetime import datetime

app = Flask(__name__)

class CodeforcesProblemRecommender:
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = NearestNeighbors(n_neighbors=10, algorithm='ball_tree')
        self.problems_df = None
        self.last_recommendations = {}
        self.BASE_URL = "https://codeforces.com/api/"
        self.HISTORY_FILE = "recommendation_history.json"
        
        try:
            with open(self.HISTORY_FILE, 'r') as f:
                self.last_recommendations = json.load(f)
        except FileNotFoundError:
            self.last_recommendations = {}

    def get_user_submissions(self, username):
        try:
            response = requests.get(f"{self.BASE_URL}user.status?handle={username}")
            if response.status_code == 200:
                return response.json()['result']
            return []
        except Exception as e:
            return []

    def fetch_problems(self):
        try:
            response = requests.get(f"{self.BASE_URL}problemset.problems")
            if response.status_code == 200:
                problems = response.json()['result']['problems']
                stats = response.json()['result']['problemStatistics']
                df = pd.DataFrame(problems)
                stats_df = pd.DataFrame(stats)
                df['solved_count'] = stats_df['solvedCount']
                df = df[df['rating'].notna()]
                return df
            return pd.DataFrame()
        except Exception as e:
            return pd.DataFrame()

    def recommend_problems(self, username):
        if self.problems_df is None:
            self.problems_df = self.fetch_problems()
        
        if self.problems_df.empty:
            return []
        
        self.problems_df = self.problems_df.sort_values('solved_count', ascending=False)
        recommended = self.problems_df.head(5)
        
        recommendations = []
        for _, problem in recommended.iterrows():
            recommendations.append({
                'name': problem['name'],
                'rating': problem['rating'],
                'solved_count': problem['solved_count'],
                'url': f"https://codeforces.com/problemset/problem/{problem['contestId']}/{problem['index']}",
                'tags': problem.get('tags', [])
            })
        
        return recommendations

recommender = CodeforcesProblemRecommender()

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    username = data.get('handle')
    
    if not username:
        return jsonify({'error': 'No username provided'}), 400
    
    recommendations = recommender.recommend_problems(username)
    return jsonify({'recommendations': recommendations})

if __name__ == '__main__':
    app.run(debug=True)
