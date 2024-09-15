from autogen import Agent
from sentence_transformers import SentenceTransformer
from sqlalchemy import create_engine, text
import os

class IrisSQLAgent(Agent):
    def __init__(self, engine):
        super().__init__()
        self.engine = engine

    def handle_query(self, query):
        with self.engine.connect() as conn:
            with conn.begin():
                result = conn.execute(text(query)).fetchall()
        return result


class VectorSearchAgent(IrisSQLAgent):
    def __init__(self, engine):
        super().__init__(engine)
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
    def vector_search(self, search_phrase, max_price=100, top_k=3):
        search_vector = self.model.encode(search_phrase, normalize_embeddings=True).tolist()
        with self.engine.connect() as conn:
            sql = text(f'''
                SELECT top 1 name,description FROM scotch_reviews 
                WHERE price < :max_price
                ORDER BY VECTOR_DOT_PRODUCT(description_vector, TO_VECTOR(:search_vector)) DESC
            ''')
            result = conn.execute(sql, {'search_vector': str(search_vector), 'max_price': max_price}).fetchall()
        return result


if __name__ == '__main__':
    username = 'demo'
    password = 'demo'
    hostname = os.getenv('IRIS_HOSTNAME', 'localhost')
    port = '1972'
    namespace = 'USER'
    CONNECTION_STRING = f"iris://{username}:{password}@{hostname}:{port}/{namespace}"

    engine = create_engine(CONNECTION_STRING)

    agent = VectorSearchAgent(engine)

    # Test run: Search for earthy and smooth scotch under $100
    search_query = "earthy and smooth taste"
    results = agent.vector_search(search_query)
    print(results[0][0])
    print(results[0][1])