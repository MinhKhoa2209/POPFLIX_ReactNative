import {
  Client,
  Databases,
  ID,
  Query,
  Account,
  Avatars,
  Storage,
} from "react-native-appwrite";
import mime from "mime";
import * as FileSystem from "expo-file-system";
import { InteractionMovie, Movie, TrendingMovie } from "@/interfaces/interfaces";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const BUCKET_ID = process.env.EXPO_PUBLIC_GOOGLE_BUCKET_ID!;
const INTERACTIONS_ID = process.env.EXPO_PUBLIC_APPWRITE_INTERACTIONS_ID!;
const RATINGS_ID = process.env.EXPO_PUBLIC_APPWRITE_RATINGS_ID!;
const COMMENTS_ID = process.env.EXPO_PUBLIC_APPWRITE_COMMENTS_ID!;
export const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setPlatform("com.dmk.movieapp");

export const account = new Account(client);
export const database = new Databases(client);
export const avatar = new Avatars(client);

export const storage = new Storage(client);

export const updateSearchCount = async (query: string, movie: any) => {
  try {
    const posterUrl = movie?.poster_url?.startsWith("http")
    ? movie.poster_url
    : `https://phimimg.com/${movie?.poster_url}`;
    
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", query),
    ]);

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        existingMovie.$id,
        {
          count: existingMovie.count + 1,
        }
      );
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm: query,
        movie_id: movie.slug,
        count: 1,
        title: movie.name,
        poster_url: posterUrl,
      });
    }

    console.log("✅ updateSearchCount thành công");
  } catch (error) {
    console.log("❌ updateSearchCount lỗi:", error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);
    return result.documents.map((doc: any) => ({
      searchTerm: doc.searchTerm,
      movie_id: doc.movie_id,
      title: doc.title,
      count: doc.count,
      poster_url: doc.poster_url,
    })) as TrendingMovie[];
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export const uploadAvatar = async (uri: string): Promise<string> => {
  try {
    const fileName = uri.split("/").pop() ?? `avatar-${Date.now()}.jpg`;
    const mimeType = mime.getType(uri) || "image/jpeg";
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) throw new Error("File does not exist at URI");

    const file = {
      uri,
      name: fileName,
      type: mimeType,
      size: fileInfo.size,
    };

    const result = await storage.createFile(BUCKET_ID, ID.unique(), file);
    const fileUrl = storage.getFileView(BUCKET_ID, result.$id).href;
    await account.updatePrefs({ avatar: fileUrl });

    return fileUrl;
  } catch (err) {
    console.error("❌ uploadAvatar failed:", err);
    throw err;
  }
};

export const getInteractionDoc = async (slug: string, userId: string) => {
  const list = await database.listDocuments(DATABASE_ID, INTERACTIONS_ID, [
    Query.equal("slug", slug),
    Query.equal("user_id", userId),
  ]);
  return list.total > 0 ? list.documents[0] : null;
};

export const saveToInteractions = async (movie: InteractionMovie) => {
  const categoryStr = movie.category.map((c) => c.name).join(", ");
  const countryStr = movie.country.map((c) => c.name).join(", ");
  try {
    const user = await account.get();
    const userId = user.$id;
    const existingDoc = await getInteractionDoc(movie.slug, userId);

    if (existingDoc) {
      await database.updateDocument(DATABASE_ID, INTERACTIONS_ID, existingDoc.$id, {
        is_favorite: true,
        is_like: true,
      });
      return;
    }

    await database.createDocument(DATABASE_ID, INTERACTIONS_ID, ID.unique(), {
      user_id: userId,
      name: movie.name,
      slug: movie.slug,
      origin_name: movie.origin_name,
      poster_url: movie.poster_url,
      year: movie.year,
      category: categoryStr,
      country: countryStr,
      time: movie.time,
      episode_current: movie.episode_current,
      episode_total: movie.episode_total,
      quality: movie.quality,
      lang: movie.lang,
      status: movie.status,
      is_copyright: movie.is_copyright,
      trailer_url: movie.trailer_url || "",
      content: movie.content || "", 
      tmdb_vote_average: movie.tmdb?.vote_average ?? 0, 
      tmdb_vote_count: movie.tmdb?.vote_count ?? 0,
      is_like: true,
      is_favorite: true,
      views: movie.views,
    });

    console.log("✅ Movie saved to favorites");
  } catch (error) {
    console.error("❌ Error saving favorite:", error);
    throw error;
  }
};

export const unsaveFavorite = async (slug: string, userId: string) => {
  const doc = await getInteractionDoc(slug, userId);
  if (!doc) return false;
  await database.updateDocument(DATABASE_ID, INTERACTIONS_ID, doc.$id, {
    is_favorite: false,
  });
  return true;
};

export const unsaveLike = async (slug: string, userId: string) => {
  const doc = await getInteractionDoc(slug, userId);
  if (!doc) return false;
  await database.updateDocument(DATABASE_ID, INTERACTIONS_ID, doc.$id, {
    is_like: false,
  });
  return true;
};

export const checkIfFavorite = async (
  slug: string,
  userId: string
): Promise<boolean> => {
  const doc = await getInteractionDoc(slug, userId);
  return doc?.is_favorite === true;
};

export const checkIfLike = async (
  slug: string,
  userId: string
): Promise<boolean> => {
  const doc = await getInteractionDoc(slug, userId);
  return doc?.is_like === true;
};

export const getFavoritesByUser = async (
  userId: string
): Promise<InteractionMovie[]> => {
  const res = await database.listDocuments(DATABASE_ID, INTERACTIONS_ID, [
    Query.equal("user_id", userId),
    Query.equal("is_favorite", true),
  ]);
  return res.documents as any;
};

export const getLikesByUser = async (
  userId: string
): Promise<InteractionMovie[]> => {
  const res = await database.listDocuments(DATABASE_ID, INTERACTIONS_ID, [
    Query.equal("user_id", userId),
    Query.equal("is_like", true),
  ]);
  return res.documents as any;
};

export const submitComment = async (slug: string, commentText: string) => {
  try {
    const user = await account.get();
    const userId = user.$id;
    const name = user.name;

    await database.createDocument(DATABASE_ID, COMMENTS_ID, ID.unique(), {
      user_id: userId,
      name: name,
      slug: slug,
      comment: commentText,
    });

    console.log("✅ Gửi bình luận thành công");
  } catch (error) {
    console.error("❌ Gửi bình luận thất bại:", error);
    throw error;
  }
};

export const submitRating = async (slug: string, rating: number) => {
  try {
    const user = await account.get();
    const userId = user.$id;
    const name = user.name;

    const existing = await database.listDocuments(DATABASE_ID, RATINGS_ID, [
      Query.equal("user_id", userId),
      Query.equal("slug", slug),
    ]);

    console.log("Rating Submission:", { userId, name, existing });

    if (existing.total > 0) {
      const docId = existing.documents[0].$id;

      await database.updateDocument(DATABASE_ID, RATINGS_ID, docId, {
        rating,
      });
      console.log("✅ Đã cập nhật đánh giá");
    } else {
      await database.createDocument(DATABASE_ID, RATINGS_ID, ID.unique(), {
        user_id: userId,
        name,
        slug,
        rating,
      });
      console.log("✅ Đã tạo đánh giá mới");
    }

  } catch (error) {
    console.error("❌ Gửi đánh giá thất bại:", error);
    throw error;
  }
};

export const getCommentsForMovie = async (slug: string) => {
  try {
    const response = await database.listDocuments(DATABASE_ID, COMMENTS_ID, [
      Query.equal("slug", slug),
      Query.orderDesc("$createdAt"),
    ]);
    return response.documents.map((doc) => ({
      user_id: doc.user_id || "",
      name: doc.name || "",
      slug: doc.slug || "",
      comment: doc.comment || "",
    }));
  } catch (error) {
    console.error("❌ Lấy danh sách bình luận thất bại:", error);
    return [];
  }
};

export const checkIfRating = async (slug: string, user_id: string): Promise<number | null> => {
  const response = await database.listDocuments(DATABASE_ID, RATINGS_ID, [
    Query.equal("user_id", user_id),
    Query.equal("slug", slug),
    Query.orderDesc("$createdAt"),
  ]);

  if (response.total > 0) {
    return response.documents[0].rating; 
  } else {
    return null;
  }
};

export const getAverageRating = async (slug: string): Promise<number | null> => {
  try {
    const result = await database.listDocuments(DATABASE_ID, RATINGS_ID, [
      Query.equal("slug", slug),
    ]);

    if (result.total === 0) return null;

    const totalRatings = result.documents.reduce((sum, doc) => {
      return sum + (doc.rating || 0);
    }, 0);

    const average = totalRatings / result.total;

    return parseFloat(average.toFixed(1)); // Làm tròn 1 chữ số thập phân
  } catch (error) {
    console.error("❌ Lỗi khi tính trung bình số sao:", error);
    return null;
  }
};

export const getTotalLikes = async (slug: string): Promise<number> => {
  try {
    const result = await database.listDocuments(DATABASE_ID, INTERACTIONS_ID, [
      Query.equal("slug", slug),     
      Query.equal("is_like", true),  
    ]);

    return result.total;
  } catch (error) {
    console.error("❌ Error getting total likes:", error);
    return 0;
  }
};
export const checkIfComment = async (
  slug: string,
  userId: string
): Promise<boolean> => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COMMENTS_ID, [
      Query.equal("slug", slug),
      Query.equal("user_id", userId),
    ]);
    return result.total > 0;
  } catch (error) {
    console.error("❌ Lỗi khi kiểm tra comment:", error);
    return false;
  }
};
