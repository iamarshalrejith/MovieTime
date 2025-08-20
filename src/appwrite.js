import { Client, Databases, Query, ID } from "appwrite";

// 🔧 Environment variables from Vite
const PROJECT_ID   = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID  = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const ENDPOINT     = import.meta.env.VITE_APPWRITE_ENDPOINT;

// 🔧 Initialize Appwrite client
const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID);

const database = new Databases(client);

/**
 * Updates the search count for a given term.
 * - If the term exists → increments its count
 * - If not → creates a new document
 */
export async function updateSearchCount(searchTerm, movie) {
  try {
    // 1. Check if the search term already exists
    const result = await database.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal("searchTerm", searchTerm)]
    );

    console.log("Search query result:", result);

    if (result.documents && result.documents.length > 0) {
      // 2. If found → update the first matching document
      const doc = result.documents[0];
      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        doc.$id,
        {
          count: (doc.count ?? 0) + 1, // safe increment
        }
      );
      console.log(`Updated search count for "${searchTerm}" → ${doc.$id}`);
    } else {
      // 3. If not found → create a new document
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
      console.log(`Created new search entry for "${searchTerm}"`);
    }
  } catch (error) {
    console.error("Error updating search count:", error);
  }
}

/**
 * Fetches trending movies based on search counts
 */
export async function getTrendingMovies() {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.limit(5),
        Query.orderDesc("count"),
      ]
    );

    console.log("Trending movies:", result.documents);
    return result.documents ?? [];
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
}
