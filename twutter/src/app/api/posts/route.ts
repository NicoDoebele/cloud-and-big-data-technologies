import { NextResponse } from "next/server";
import mongoose, { FlattenMaps, Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";

// Define the Post interface
interface Post {
  _id: Types.ObjectId;
  content: string;
  author: string;
  createdAt: Date;
  likes: number;
}

// Define the Comment interface
interface Comment {
  _id: Types.ObjectId;
  content: string;
  author: string;
  createdAt: Date;
  post_id: Types.ObjectId;
}

// Define the lean result types
type LeanPostResult = FlattenMaps<Post> & { __v: number };
type LeanCommentResult = FlattenMaps<Comment> & { __v: number };

// Create the Post schema
const PostSchema = new mongoose.Schema<Post>({
  content: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 }
});

// Create the Comment schema
const CommentSchema = new mongoose.Schema<Comment>({
  content: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  post_id: { type: mongoose.Schema.Types.ObjectId, required: true }
});

// Create the models (use existing if already created)
const Post = mongoose.models.Post || mongoose.model<Post>("Post", PostSchema);
const Comment = mongoose.models.Comment || mongoose.model<Comment>("Comment", CommentSchema);

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    console.log("Connected to database");

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const author = searchParams.get("author");
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = parseInt(searchParams.get("skip") || "0");

    // Build query
    const query: any = {};
    if (author) {
      query.author = author;
    }
    console.log("Query:", query);

    // Execute query with pagination
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as LeanPostResult[];
    
    console.log("Posts found:", posts.length);
    console.log("First post:", posts[0]);

    // Get comments for these posts
    const postIds = posts.map(post => post._id);
    console.log("Post IDs:", postIds);
    const comments = await Comment.find({ post_id: { $in: postIds } })
      .sort({ createdAt: -1 })
      .lean() as LeanCommentResult[];

    // Group comments by post_id
    const commentsByPost = comments.reduce((acc: Record<string, LeanCommentResult[]>, comment) => {
      const postId = comment.post_id.toString();
      if (!acc[postId]) {
        acc[postId] = [];
      }
      acc[postId].push(comment);
      return acc;
    }, {});

    // Attach comments to their respective posts
    const postsWithComments = posts.map(post => ({
      _id: post._id.toString(),
      content: post.content,
      author: post.author,
      createdAt: post.createdAt,
      likes: post.likes,
      comments: commentsByPost[post._id.toString()] || []
    }));

    // Get total count for pagination
    const total = await Post.countDocuments(query);

    return NextResponse.json({
      posts: postsWithComments,
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
      likes: 0
    });

    // Return post with empty comments array to maintain consistent response structure
    return NextResponse.json({
      ...post.toObject(),
      comments: []
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
