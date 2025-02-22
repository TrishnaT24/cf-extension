from flask import Flask, request, jsonify
from flask_cors import CORS
from codeforces_recommender import CodeforcesProblemRecommender
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the recommender as a global variable
recommender = CodeforcesProblemRecommender()

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "healthy"}), 200

@app.route('/api/process_handle', methods=['POST'])
def process_handle():
    try:
        # Print received data for debugging
        print("Received request data:", request.get_data())
        print("Request headers:", dict(request.headers))

        # Get the handle from the request
        data = request.get_json()
        if not data:
            print("No JSON data received")
            return jsonify({
                "error": "No JSON data received"
            }), 400

        if 'handle' not in data:
            print("Missing handle in request")
            return jsonify({
                "error": "Missing handle in request"
            }), 400

        handle = data['handle']
        print(f"Processing handle: {handle}")

        # Get recommendations using the model
        user_rating, solved_problems, problem_stats = recommender.analyze_user_history(handle)
        
        if user_rating == 0:
            user_rating = 1200  # Default rating if not found
            
        recommendations = recommender.recommend_problems(user_rating, solved_problems)

        if not recommendations:
            return jsonify({
                "error": "Could not generate recommendations",
                "handle": handle
            }), 404

        # Return recommendations
        response_data = {
            "handle": handle,
            "user_rating": user_rating,
            "total_solved": problem_stats.get('total_solved', 0),
            "recommendations": recommendations
        }
        
        print("Sending response:", response_data)
        return jsonify(response_data), 200

    except Exception as e:
        # Log the full error for debugging
        print(f"Error processing handle: {str(e)}")
        print(traceback.format_exc())
        
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')