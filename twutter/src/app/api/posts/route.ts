import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";

// Define the Post interface
interface Post {
  _id: string;
  content: string;
  author: string;
  createdAt: Date;
  likes: number;
  comments: Array<{
    content: string;
    author: string;
    createdAt: Date;
  }>;
}

// Create the Post schema
const PostSchema = new mongoose.Schema<Post>({
  content: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  comments: [
    {
      content: { type: String, required: true },
      author: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

// Create the model (use existing if already created)
const Post = mongoose.models.Post || mongoose.model<Post>("Post", PostSchema);

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const author = searchParams.get("author");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = parseInt(searchParams.get("skip") || "0");

    // Build query
    const query: any = {};
    if (author) {
      query.author = author;
    }

    // Execute query with pagination
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Post.countDocuments(query);

    return NextResponse.json({
      posts,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { content, author } = body;

    // Validate required fields
    if (!content || !author) {
      return NextResponse.json(
        { error: "Content and author are required" },
        { status: 400 }
      );
    }

    // Verify that the author exists
    const User = mongoose.models.User;
    const userExists = await User.findOne({ username: author });
    if (!userExists) {
      return NextResponse.json(
        { error: "Author does not exist" },
        { status: 400 }
      );
    }

    // Create new post
    const post = await Post.create({
      content,
      author,
      likes: 0,
      comments: [],
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
