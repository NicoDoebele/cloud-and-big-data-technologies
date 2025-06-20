import { NextResponse } from "next/server";
import mongoose, { FlattenMaps, Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";

// Force dynamic rendering to prevent build-time analysis
export const dynamic = 'force-dynamic';

// Define the Post interface
interface Post {
  _id: Types.ObjectId;
  content: string;
  author: string;
  createdAt: Date;
  likes: number;
}

// Define the User interface
interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  avatar: string;
  createdAt: Date;
  followers: string[];
  following: string[];
}

// Create the schemas
const PostSchema = new mongoose.Schema<Post>({
  content: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 }
});

const UserSchema = new mongoose.Schema<User>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  bio: { type: String, default: "" },
  avatar: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  followers: [{ type: String }],
  following: [{ type: String }],
});

// Create the models
const Post = mongoose.models.Post || mongoose.model<Post>("Post", PostSchema);
const User = mongoose.models.User || mongoose.model<User>("User", UserSchema);

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type"); // "posts", "users", or "all"
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query) {
      return NextResponse.json({
        posts: [],
        users: [],
        message: "No search query provided"
      });
    }

    const results: any = {
      posts: [],
      users: []
    };

    // Search posts if type is "posts" or "all"
    if (type === "posts" || type === "all" || !type) {
      const posts = await Post.find({
        $or: [
          { content: { $regex: query, $options: "i" } },
          { author: { $regex: query, $options: "i" } }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      results.posts = posts.map((post: { _id: Types.ObjectId; content: string; author: string; createdAt: Date; likes: number }) => ({
        _id: post._id.toString(),
        content: post.content,
        author: post.author,
        createdAt: post.createdAt,
        likes: post.likes,
        type: "post"
      }));
    }

    // Search users if type is "users" or "all"
    if (type === "users" || type === "all" || !type) {
      const users = await User.find({
        $or: [
          { username: { $regex: query, $options: "i" } },
          { displayName: { $regex: query, $options: "i" } },
          { bio: { $regex: query, $options: "i" } }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      results.users = users.map(user => ({
        ...user,
        type: "user"
      }));
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    );
  }
} 