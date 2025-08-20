import { Client, Databases, Query, ID } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client();
client.setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT);
client.setProject(PROJECT_ID);

const database = new Databases(client);

export async function updateSearchCount(searchTerm, movie) {
  try {
    // 1. Check if the search term exists
    const result = await database.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal("searchTerm", searchTerm)]
    );

    if (result.documents.length > 0) {
      // 2. If it exists, update the count
      const doc = result.documents[0];
      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        doc.$id,
        {
          count: doc.count + 1,
        }
      );
    } else {
      // 3. If it doesn’t exist, create a new document
      await database.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          searchTerm,
          count: 1,
          movie_id: movie.id,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        }
      );
    }
  } catch (error) {
    console.error("Error updating search count:", error);
  }
}

export async function getTrendingMovies(){
    try {
        const result = await database.listDocuments(DATABASE_ID,COLLECTION_ID,[
            Query.limit(5),
            Query.orderDesc("count")
        ])
        return result.documents;
    } catch (error) {
        console.log(error)
    }
}