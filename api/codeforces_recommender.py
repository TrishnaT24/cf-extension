import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
import requests
import time
from typing import List, Dict, Tuple

class CodeforcesProblemRecommender:
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = NearestNeighbors(n_neighbors=10, algorithm='ball_tree')
        self.problems_df = None
        self.user_history = []
        self.current_batch = []
        self.BASE_URL = "https://codeforces.com/api/"
        self.user_info = None

    def get_user_info(self, username: str) -> Dict:
        """Fetch user information from Codeforces API"""
        try:
            response = requests.get(f"{self.BASE_URL}user.info?handles={username}")
            time.sleep(1)  # Rate limiting

            if response.status_code != 200:
                print(f"Error: API returned status code {response.status_code}")
                return None

            data = response.json()
            if data['status'] == 'OK':
                return data['result'][0]
            return None
        except Exception as e:
            print(f"Error fetching user info: {str(e)}")
            return None

    def get_user_submissions(self, username: str) -> List[Dict]:
        """Fetch user's submission history"""
        try:
            response = requests.get(f"{self.BASE_URL}user.status?handle={username}")
            time.sleep(1)  # Rate limiting

            if response.status_code != 200:
                print(f"Error: API returned status code {response.status_code}")
                return []

            data = response.json()
            if data['status'] == 'OK':
                return data['result']
            return []
        except Exception as e:
            print(f"Error fetching user submissions: {str(e)}")
            return []

    def analyze_user_history(self, username: str) -> Tuple[int, List[str], Dict]:
        """Analyze user's problem-solving history"""
        user_info = self.get_user_info(username)
        if not user_info:
            print(f"Could not find user: {username}")
            return 0, [], {}

        submissions = self.get_user_submissions(username)
        if not submissions:
            print(f"No submissions found for user: {username}")
            return user_info.get('rating', 0), [], {}

        # Analyze solved problems
        solved_problems = set()
        problem_stats = {
            'total_solved': 0,
            'by_rating': {},
            'by_tags': {},
            'recent_ratings': []
        }

        for submission in submissions:
            if submission['verdict'] == 'OK':
                problem = submission['problem']
                problem_id = f"{problem.get('name', '')}"

                if problem_id not in solved_problems:
                    solved_problems.add(problem_id)
                    problem_stats['total_solved'] += 1

                    # Track ratings
                    rating = problem.get('rating', 0)
                    if rating > 0:
                        problem_stats['by_rating'][rating] = problem_stats['by_rating'].get(rating, 0) + 1
                        problem_stats['recent_ratings'].append(rating)

                    # Track tags
                    for tag in problem.get('tags', []):
                        problem_stats['by_tags'][tag] = problem_stats['by_tags'].get(tag, 0) + 1

        # Keep only recent ratings for analysis
        problem_stats['recent_ratings'] = problem_stats['recent_ratings'][-20:]

        return user_info.get('rating', 0), list(solved_problems), problem_stats

    def fetch_problems(self) -> pd.DataFrame:
        """Fetch problems from Codeforces API"""
        try:
            problems_response = requests.get(f"{self.BASE_URL}problemset.problems")
            time.sleep(1)  # Rate limiting

            if problems_response.status_code != 200:
                print(f"Error: API returned status code {problems_response.status_code}")
                return pd.DataFrame()

            data = problems_response.json()

            if data['status'] == 'OK':
                problems = []
                problems_data = data['result']['problems']
                problems_stats = data['result']['problemStatistics']

                stats_dict = {f"{stat['contestId']}-{stat['index']}": stat.get('solvedCount', 0)
                            for stat in problems_stats}

                for problem in problems_data:
                    if 'rating' in problem:
                        problem_key = f"{problem.get('contestId', 0)}-{problem.get('index', '')}"
                        problems.append({
                            'contestId': problem.get('contestId', 0),
                            'index': problem.get('index', ''),
                            'name': problem.get('name', ''),
                            'rating': problem.get('rating', 0),
                            'solved_count': stats_dict.get(problem_key, 0),
                            'tags': problem.get('tags', [])
                        })

                df = pd.DataFrame(problems)

                dsa_tags = ['implementation', 'dp', 'greedy', 'data structures',
                           'graphs', 'binary search', 'sortings', 'trees']
                df['is_dsa'] = df['tags'].apply(lambda x: any(tag in dsa_tags for tag in x))
                filtered_df = df[df['is_dsa']].copy()

                if filtered_df.empty or not all(col in filtered_df.columns
                                             for col in ['rating', 'solved_count']):
                    print("Error: Required columns missing in fetched data")
                    return pd.DataFrame()

                return filtered_df

            print("Error: API returned non-OK status")
            return pd.DataFrame()

        except Exception as e:
            print(f"Error fetching problems: {str(e)}")
            return pd.DataFrame()

    def prepare_features(self, df: pd.DataFrame) -> np.ndarray:
        """Prepare features for the model"""
        if df.empty:
            return np.array([])
        features = df[['rating', 'solved_count']].values
        return self.scaler.fit_transform(features)

    def initialize_model(self):
        """Initialize and train the model"""
        self.problems_df = self.fetch_problems()
        if not self.problems_df.empty:
            features = self.prepare_features(self.problems_df)
            if features.size > 0:
                self.model.fit(features)
            else:
                print("Error: No features available for model training")

    def get_problem_url(self, contest_id: int, index: str) -> str:
        """Generate problem URL"""
        return f"https://codeforces.com/problemset/problem/{contest_id}/{index}"

    def recommend_problems(self, user_rating: int, solved_problems: List[str],
                         performance_factor: float = 1.0) -> List[Dict]:
        """Recommend problems based on user rating and history"""
        if self.problems_df is None or self.problems_df.empty:
            self.initialize_model()

        if self.problems_df is None or self.problems_df.empty:
            print("Error: No problems available for recommendation")
            return []

        rating_min = int(user_rating - 200 * performance_factor)
        rating_max = int(user_rating + 200 * performance_factor)

        eligible_problems = self.problems_df[
            (self.problems_df['rating'].between(rating_min, rating_max)) &
            (~self.problems_df['name'].isin(solved_problems))
        ]

        if eligible_problems.empty:
            print(f"No eligible problems found in rating range {rating_min}-{rating_max}")
            return []

        if len(self.current_batch) > 0:
            if performance_factor > 1:
                eligible_problems = eligible_problems.sort_values('solved_count', ascending=True)
            else:
                eligible_problems = eligible_problems.sort_values('solved_count', ascending=False)

        recommended = eligible_problems.head(5)
        self.current_batch = recommended['name'].tolist()

        recommendations = []
        for _, problem in recommended.iterrows():
            recommendations.append({
                'name': problem['name'],
                'rating': problem['rating'],
                'solved_count': problem['solved_count'],
                'url': self.get_problem_url(problem['contestId'], problem['index']),
                'tags': problem['tags']
            })

        return recommendations

    def adjust_recommendations(self, performance_scores: List[float]) -> float:
        """Adjust future recommendations based on performance"""
        if not performance_scores or not self.current_batch:
            return 1.0

        avg_performance = sum(performance_scores) / len(performance_scores)

        if avg_performance > 0.8:
            return 1.2
        elif avg_performance > 0.6:
            return 1.1
        elif avg_performance < 0.3:
            return 0.8
        elif avg_performance < 0.5:
            return 0.9
        else:
            return 1.0

def main():
    recommender = CodeforcesProblemRecommender()

    # Get username
    username = input("Enter your Codeforces username: ")

    # Analyze user history
    user_rating, solved_problems, problem_stats = recommender.analyze_user_history(username)

    if user_rating == 0:
        print("Could not determine user rating. Using default rating of 1200.")
        user_rating = 1200

    print(f"\nUser Analysis:")
    print(f"Current Rating: {user_rating}")
    print(f"Total Problems Solved: {problem_stats['total_solved']}")
    print("\nProblems solved by rating:")
    for rating in sorted(problem_stats['by_rating'].keys()):
        print(f"Rating {rating}: {problem_stats['by_rating'][rating]} problems")

    # Stage 1: Initial recommendations
    initial_recommendations = recommender.recommend_problems(user_rating, solved_problems)

    if initial_recommendations:
        print("\nStage 1 - Initial Recommendations:")
        for i, rec in enumerate(initial_recommendations, 1):
            print(f"\n{i}. {rec['name']}")
            print(f"Rating: {rec['rating']}")
            print(f"Solved by: {rec['solved_count']} users")
            print(f"URL: {rec['url']}")
            print(f"Tags: {', '.join(rec['tags'])}")

        # Stage 2: Get user performance and adjust
        print("\nAfter solving the problems, enter your performance scores (0-1) for each problem.")
        print("For example: 0.8 0.9 0.7 0.85 0.95")
        performance_input = input("Enter scores (or press Enter to skip): ")

        if performance_input.strip():
            try:
                performance_scores = [float(x) for x in performance_input.split()]
                performance_factor = recommender.adjust_recommendations(performance_scores)

                next_recommendations = recommender.recommend_problems(
                    user_rating,
                    solved_problems + recommender.current_batch,
                    performance_factor
                )

                if next_recommendations:
                    print("\nStage 2 - Adjusted Recommendations:")
                    for i, rec in enumerate(next_recommendations, 1):
                        print(f"\n{i}. {rec['name']}")
                        print(f"Rating: {rec['rating']}")
                        print(f"Solved by: {rec['solved_count']} users")
                        print(f"URL: {rec['url']}")
                        print(f"Tags: {', '.join(rec['tags'])}")
            except ValueError:
                print("Invalid performance scores. Skipping adjusted recommendations.")
    else:
        print("No recommendations available. Please check your internet connection and try again.")

if __name__ == "__main__":
    main()