export interface Movie {
  _id?: string; 
  name: string; 
  slug: string; 
  origin_name: string;
  poster_url: string; 
  year: number;
  category: { name: string }[];
  country: { name: string }[];
  time: string; 
  episode_current: string;
  episode_total: string;
  quality: string;
  lang: string;
  status: string;
  is_copyright: boolean;
  trailer_url?: string;
  content: string;
  tmdb?: {
    vote_average: number;
    vote_count: number;
  };
}


export interface TrendingMovie {
  searchTerm: string;
  movie_id: string; 
  title: string;
  count: number;
  poster_url: string;
}


interface TrendingCardProps {
  movie: TrendingMovie;
  index: number;
}

export interface Episode {
  server_name: string; 
  name: string;          
  slug: string;         
  filename: string;      
  link_embed: string;   
  link_m3u8: string;     
}


interface GlobalContextType {
  isLogged: boolean;
  user: User | null;
  loading: boolean;
  refetch: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;

}

interface User {
  $id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt?: string; 
  role?: string;     
}

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

 interface InteractionMovie {
  $id: string; 
  user_id: string; 
  name: string;
  slug: string;
  origin_name: string;
  poster_url: string;
  year: number;
  category: { name: string }[];
  country: { name: string }[];
  time: string;
  episode_current: string;
  episode_total: string;
  quality: string;
  lang: string;
  status: string;
  is_copyright: boolean;
  trailer_url?: string;
  content: string;
  tmdb?: {
    vote_average: number;
    vote_count: number;
  };
  is_like: boolean;
  is_favorite: boolean;
  views: number;
}

interface Comment {
  user_id: string;
  name: string;
  slug: string;
  comment: string;
};