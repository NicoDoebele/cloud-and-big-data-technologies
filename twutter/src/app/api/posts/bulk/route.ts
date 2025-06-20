import { NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
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

// Create the Post schema
const PostSchema = new mongoose.Schema<Post>({
  content: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 }
});

// Create the model (use existing if already created)
const Post = mongoose.models.Post || mongoose.model<Post>("Post", PostSchema);

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { posts } = body;

    // Validate input
    if (!Array.isArray(posts)) {
      return NextResponse.json(
        { error: "Posts must be an array" },
        { status: 400 }
      );
    }

    if (posts.length === 0) {
      return NextResponse.json(
        { error: "Posts array cannot be empty" },
        { status: 400 }
      );
    }

    // Validate each post
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      if (!post.content || !post.author) {
        return NextResponse.json(
          { error: `Post at index ${i} is missing content or author` },
          { status: 400 }
        );
      }
    }

    // Get unique authors to verify they exist
    const uniqueAuthors = [...new Set(posts.map(post => post.author))];
    const User = mongoose.models.User;
    const existingUsers = await User.find({ username: { $in: uniqueAuthors } });
    const existingUsernames = existingUsers.map(user => user.username);

    // Check if all authors exist
    const missingAuthors = uniqueAuthors.filter(author => !existingUsernames.includes(author));
    if (missingAuthors.length > 0) {
      return NextResponse.json(
        { error: `Authors do not exist: ${missingAuthors.join(', ')}` },
        { status: 400 }
      );
    }

    // Prepare posts for insertion
    const postsToInsert = posts.map(post => ({
      content: post.content,
      author: post.author,
      likes: post.likes || 0
    }));

    // Process in chunks of 1000
    const CHUNK_SIZE = 1000;
    const allCreatedPosts = [];
    
    for (let i = 0; i < postsToInsert.length; i += CHUNK_SIZE) {
      const chunk = postsToInsert.slice(i, i + CHUNK_SIZE);
      const createdChunk = await Post.insertMany(chunk);
      allCreatedPosts.push(...createdChunk);
    }

    // Return posts with empty comments arrays to maintain consistent response structure
    const postsWithComments = allCreatedPosts.map(post => ({
      ...post.toObject(),
      comments: []
    }));

    return NextResponse.json({
      posts: postsWithComments,
      count: allCreatedPosts.length
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating posts in bulk:", error);
    return NextResponse.json(
      { error: "Failed to create posts" },
      { status: 500 }
    );
  }
} 