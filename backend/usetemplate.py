import json
import requests
import autogen
from autogen import Agent
from sentence_transformers import SentenceTransformer
from sqlalchemy import create_engine, text
import os

# Load the JSON template
json_template = {
    "llm_type": "gpt-4o",
    "max_consecutive_auto_reply": 5,
    "extra_agent": "csv_search",  # Set to csv_search to use VectorSearchAgent
    "user_message": "what whisky is earthy and smooth?"
}

# Extract values from the JSON
llm_type = json_template["llm_type"]
max_consecutive_auto_reply = json_template["max_consecutive_auto_reply"]
extra_agent = json_template["extra_agent"]
user_message = json_template["user_message"]

# Configuration for LLM
config_list = [
    {
        'model': llm_type,
        'api_key': 'sk-qTbIVMe5neqmkGQa3e_WMY1Oml15Wc5MOJ8VvnADfZT3BlbkFJk3kpZe5y5O80mwpvIdwFaExoMM-B4tiiZzLE7SFhkA',  # Replace with your actual API key
    }
]

# Iris SQL agent for handling queries on SQL database
class IrisSQLAgent(Agent):
    def __init__(self, engine):
        super().__init__()
        self.engine = engine

    def handle_query(self, query):
        with self.engine.connect() as conn:
            with conn.begin():
                result = conn.execute(text(query)).fetchall()
        return result

# Define the Vector Search Agent using SentenceTransformer
class VectorSearchAgent(IrisSQLAgent):
    def __init__(self, engine):
        super().__init__(engine)
        self.model = SentenceTransformer('all-MiniLM-L6-v2')  # Model for vector embedding
        
    def vector_search(self, search_phrase, max_price=100, top_k=3):
        # Encode the search phrase to a vector and format it as a string
        search_vector = self.model.encode(search_phrase, normalize_embeddings=True).tolist()
        search_vector_str = ','.join(map(str, search_vector))  # Convert list to a comma-separated string
        
        with self.engine.connect() as conn:
            # Prepare and execute the SQL query
            sql = text(f'''
                SELECT top 1 name,description FROM scotch_reviews 
                WHERE price < :max_price
                ORDER BY VECTOR_DOT_PRODUCT(description_vector, TO_VECTOR(:search_vector)) DESC
            ''')
            # Pass the search vector as a formatted string
            result = conn.execute(sql, {'max_price': max_price, 'search_vector': search_vector_str, 'top_k': top_k}).fetchall()
        return result

# Replace csv_search_function with vector search functionality
def csv_search_function(query):
    search_agent = VectorSearchAgent(engine=engine)
    results = search_agent.vector_search(search_phrase=query, max_price=100, top_k=3)
    if results:
        return results
    else:
        return "No results found for this query."

# Placeholder function for web search
def web_search_function(query):
    return f"Searching web for query: {query}. (This functionality is not implemented.)"

# Initialize the database engine for IRIS
username = 'demo'
password = 'demo'
hostname = os.getenv('IRIS_HOSTNAME', 'localhost')
port = '1972'
namespace = 'USER'
CONNECTION_STRING = f"iris://{username}:{password}@{hostname}:{port}/{namespace}"

engine = create_engine(CONNECTION_STRING)

# Select the extra agent based on the template
extra_agent_instance = None
if extra_agent == "csv_search":
    ask_extra_agent = lambda query: csv_search_function(query)
elif extra_agent == "web_search":
    ask_extra_agent = lambda query: web_search_function(query)

# Planner agent
planner = autogen.AssistantAgent(
    name="planner",
    llm_config={"config_list": config_list},
    system_message="You are a helpful AI assistant. You suggest coding and reasoning steps for another AI assistant to accomplish a task. Do not suggest concrete code."
)

planner_user = autogen.UserProxyAgent(
    name="planner_user",
    max_consecutive_auto_reply=0,
    human_input_mode="NEVER",
    code_execution_config={"use_docker": False}
)

# Define the function to ask the planner
def ask_planner(message):
    planner_user.initiate_chat(planner, message=message)
    return planner_user.last_message()["content"]

# Define the assistant agent with the function map
assistant = autogen.AssistantAgent(
    name="assistant",
    llm_config={
        "temperature": 0,
        "timeout": 600,
        "cache_seed": 42,
        "config_list": config_list,
        "functions": [
            {
                "name": "ask_planner",
                "description": "Ask the planner for a plan to finish a task or suggest new plans.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "message": {
                            "type": "string",
                            "description": "Question to ask the planner.",
                        }
                    },
                    "required": ["message"]
                }
            },
            {
                "name": "ask_extra_agent",
                "description": f"Fetch data using the {extra_agent} agent.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": f"Search query for the {extra_agent} agent.",
                        }
                    },
                    "required": ["query"]
                }
            }
        ]
    },
    function_map={
        "ask_planner": ask_planner,
        "ask_extra_agent": ask_extra_agent
    }
)

# UserProxyAgent that terminates after the specified number of auto replies
user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE",
    max_consecutive_auto_reply=max_consecutive_auto_reply,
    code_execution_config={"use_docker": False},
    function_map={"ask_planner": ask_planner, "ask_extra_agent": ask_extra_agent}
)

# Start the interaction with the assistant
user_proxy.initiate_chat(
    assistant,
    message=user_message
)
