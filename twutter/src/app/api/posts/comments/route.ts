import { NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";

// Force dynamic rendering to prevent build-time analysis
export const dynamic = 'force-dynamic';

// Define the Comment interface
interface Comment {
  _id: Types.ObjectId;
  content: string;
  author: string;
  createdAt: Date;
  post_id: Types.ObjectId;
}

// Create the Comment schema
const CommentSchema = new mongoose.Schema<Comment>({
  content: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  post_id: { type: mongoose.Schema.Types.ObjectId, required: true }
});

// Create the models (use existing if already created)
const Comment = mongoose.models.Comment || mongoose.model<Comment>("Comment", CommentSchema);
const Post = mongoose.models.Post || mongoose.model("Post", new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 }
}));

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { content, postId, author } = body;

    // Validate required fields
    if (!content || !postId || !author) {
      return NextResponse.json(
        { error: "Content, postId, and author are required" },
        { status: 400 }
      );
    }

    // Validate postId format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: "Invalid post ID" },
        { status: 400 }
      );
    }

    // Verify that the post exists
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
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

    // Create new comment
    const comment = await Comment.create({
      content,
      author,
      post_id: postId
    });

    return NextResponse.json(comment.toObject(), { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
} 