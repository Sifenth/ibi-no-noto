import Home from "./home-client";
import { getPublishedPosts } from "../lib/posts";

export default async function Page() {
  return <Home posts={await getPublishedPosts()} />;
}
