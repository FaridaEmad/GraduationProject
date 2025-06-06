import pandas as pd 
from sklearn.neighbors import NearestNeighbors
from sqlalchemy import create_engine
from fastapi import FastAPI
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler

app = FastAPI()

knn = None 
user_item_matrix = None
businesses_df = None
similarity_matrix = None
encoder = None
scaler = None
feature_columns = ["Category", "City", "Area"]

connection_string = "mssql+pyodbc://@DESKTOP-OAFR7NA/DealsHubDB?trusted_connection=yes&driver=ODBC+Driver+17+for+SQL+Server"
engine = create_engine(connection_string)

def fetch_reviews():
    try:
        query = "SELECT ReviewId, Rating, UserId, BusinessId, CreatedAt FROM Reviews"
        data = pd.read_sql(query, engine)
        print("Reviews fetched successfully.")
        return data
    except Exception as e:
        print(f"Error in fetching reviews: {e}")
        return None
    
def fetch_Businesses():
    try:
        query = "SELECT BusinessId, Area FROM Businesses"
        data = pd.read_sql(query, engine)
        print("Businesses fetched successfully.")
        return data
    except Exception as e:
        print(f"Error in fetching businesses: {e}")
        return 
    
def fetch_Categories():
    try:
        query = "SELECT CategoryId, Name FROM Categories"
        data = pd.read_sql(query, engine)
        print("Categories fetched successfully.")
        return data
    except Exception as e:
        print(f"Error in fetching Categories: {e}")
        return 
    
def fetch_Businesses_for_content():
    try:
        query = "SELECT BusinessId, Name, Area, City, CategoryId FROM Businesses"
        data = pd.read_sql(query, engine)
        print("Businesses fetched successfully.")
        return data
    except Exception as e:
        print(f"Error in fetching businesses: {e}")
        return None

def retrain_user_model():
    global knn, user_item_matrix, businessesData

    data = fetch_reviews()

    if data is None or data.empty:
        print("No data available for training.")
        return None

    data["CreatedAt"] = pd.to_datetime(data["CreatedAt"])
    data = data.sort_values("CreatedAt").drop_duplicates(subset=["UserId", "BusinessId"], keep="last") 

    user_item_matrix = data.pivot(index='UserId', columns='BusinessId', values='Rating').fillna(0)

    knn = NearestNeighbors(metric="cosine", algorithm="brute", n_neighbors=5)
    knn.fit(user_item_matrix)

    print("Model trained successfully.")
    return knn

def retrian_content():
    global businesses_df, similarity_matrix, encoder, scaler

    reviews = fetch_reviews()
    if reviews is None or reviews.empty:
        print("No reviews available for training.")
        return None
    
    businesses = fetch_Businesses_for_content()
    if businesses is None or businesses.empty:
        print("No businesses available for training.")
        return None
    
    categories = fetch_Categories()
    if categories is None or categories.empty:
        print("No categories available for training.")
        return None
    
    reviews["CreatedAt"] = pd.to_datetime(reviews["CreatedAt"])
    reviews = reviews.sort_values("CreatedAt").drop_duplicates(subset=["UserId", "BusinessId"], keep="last") 

    avg = reviews.groupby("BusinessId")["Rating"].mean().reset_index().rename(columns={"Rating": "Avg_Rating"})

    merged = businesses.merge(avg, on="BusinessId", how="left")
    merged["Avg_Rating"].fillna(0, inplace=True)

    businesses_df = merged.merge(categories, on="CategoryId", how="left", suffixes=('_business', '_category'))
    businesses_df = businesses_df.rename(columns={
        "Name_business": "BusinessName",
        "Name_category": "Category"
    })

    combined = businesses_df[feature_columns]
    encoder = OneHotEncoder(sparse_output=False)
    encoded = encoder.fit_transform(combined)

    scaler = MinMaxScaler()
    features = scaler.fit_transform(encoded)

    similarity_matrix = cosine_similarity(features)
    print("Content-based model trained.")

def recommendRestaurantsToUserInArea(userId: int, area: str, numOfRecommends: int = 6):
    retrain_user_model()
    
    if userId not in user_item_matrix.index:
        return "User Not Found"

    user_idx = user_item_matrix.index.get_loc(userId)
    distances, indices = knn.kneighbors([user_item_matrix.iloc[user_idx]], n_neighbors=6)

    similar_users = user_item_matrix.iloc[indices.flatten()[1:]]
    
    recommended_businesses = (similar_users.mean().sort_values(ascending=False)).index

    businessesData = fetch_Businesses()

    filtered_businesses = businessesData[businessesData['Area'] == area]['BusinessId']

    final_recommendations = [r for r in recommended_businesses if r in filtered_businesses.values]

    return final_recommendations[:numOfRecommends]

def recommendRestaurantsToUser(userId: int, numOfRecommends: int = 6):
    retrain_user_model()

    if userId not in user_item_matrix.index:
        return "User Not Found"

    user_idx = user_item_matrix.index.get_loc(userId)
    distances, indecies = knn.kneighbors([user_item_matrix.iloc[user_idx]], n_neighbors=6)

    similar_users = user_item_matrix.iloc[indecies.flatten()[1:]]
    recommend_businesses = (similar_users.mean().sort_values(ascending=False)).index[:numOfRecommends]

    return recommend_businesses.tolist()

def content_recommend(businessID: int, top_n: int = 5):
    retrian_content()

    if businessID not in businesses_df["BusinessId"].values:
        return []

    idx = businesses_df.index[businesses_df["BusinessId"] == businessID][0]

    business_name = businesses_df.loc[idx, "BusinessName"]

    sims = list(enumerate(similarity_matrix[idx]))

    sims_sorted = sorted(
        sims,
        key=lambda x: (x[1], businesses_df.loc[x[0], "Avg_Rating"]),
        reverse=True
    )

    sim_scores = sims_sorted[:top_n + 1]
    rec_indices = [i for i, score in sim_scores]

    recommended_businesses = businesses_df.iloc[rec_indices][["BusinessId", "BusinessName", "Area", "Avg_Rating"]].copy()

    recommended_businesses = recommended_businesses[recommended_businesses["BusinessName"] != business_name]

    recommended_businesses = recommended_businesses.drop_duplicates(subset=["BusinessName"], keep="first")

    recommended_businesses = recommended_businesses.reset_index(drop=True)

    return recommended_businesses.head(top_n)["BusinessId"].tolist()

@app.get("/userRecommendWithArea")
async def userRecommendWithArea(userId: int, area: str, numOfRecommends: int = 6):
    recommendations = recommendRestaurantsToUserInArea(userId, area, numOfRecommends)
    return recommendations

@app.get("/userRecommend")
async def userRecommend(userId: int, numOfRecommends: int = 6):
    recommendations = recommendRestaurantsToUser(userId, numOfRecommends)
    return recommendations

@app.get("/contentRecommend")
async def businessRecommend(businessId: int, topN: int = 5):
    return content_recommend(businessId, topN)

#uvicorn UserRecommender:app --reload

recommendations = recommendRestaurantsToUserInArea(500, "Zamalek", 6)
print(f"user recommender: {recommendations}")

contentRecommendations = content_recommend(500)
print(f"content recommender {contentRecommendations}")