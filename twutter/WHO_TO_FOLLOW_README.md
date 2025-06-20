# Who to Follow Feature

This document describes the implementation of the "Who to follow" feature in the Twutter application.

## Overview

The "Who to follow" feature displays a list of registered users in the right sidebar, allowing users to discover and follow other users on the platform.

## Components

### WhoToFollow Component (`src/components/WhoToFollow.tsx`)

A React component that:
- Fetches user data from the `/api/users` endpoint
- Displays users with their display name, username, and bio
- Shows a loading state while fetching data
- Handles errors gracefully with retry functionality
- Provides a "Show more" button to load additional users
- Includes a "Follow" button for each user (functionality to be implemented)

### Features

1. **User Display**: Shows user avatars (initials), display names, usernames, and bios
2. **Pagination**: Initially shows 10 users, with option to load more (up to 50)
3. **Loading States**: Skeleton loading animation while fetching data
4. **Error Handling**: Displays error messages with retry functionality
5. **Responsive Design**: Works on desktop and mobile devices
6. **Dark Mode Support**: Compatible with light and dark themes

## API Endpoint

### GET `/api/users`

Returns a list of users with pagination support.

**Query Parameters:**
- `limit` (optional): Number of users to return (default: 10)
- `skip` (optional): Number of users to skip (default: 0)
- `username` (optional): Filter users by username (case-insensitive)

**Response:**
```json
{
  "users": [
    {
      "_id": "user_id",
      "username": "username",
      "email": "email@example.com",
      "displayName": "Display Name",
      "bio": "User bio",
      "avatar": "avatar_url",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "followers": [],
      "following": []
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 10,
    "skip": 0,
    "hasMore": true
  }
}
```

## Database Setup

### Seeding the Database

To populate the database with sample user data:

1. Ensure MongoDB is running and accessible
2. Set up your environment variables in `.env.local`:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ```
3. Run the seeding script:
   ```bash
   npm run seed
   ```

This will populate the database with 64 sample users from the `data/users.json` file.

### User Schema

```typescript
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
```

## Usage

The `WhoToFollow` component is automatically included in the main page layout (`src/app/page.tsx`) and appears in the right sidebar on desktop devices.

### Integration

```tsx
import WhoToFollow from "@/components/WhoToFollow";

// In your component
<WhoToFollow />
```

## Future Enhancements

1. **Follow Functionality**: Implement actual follow/unfollow functionality
2. **User Recommendations**: Add algorithm to suggest relevant users to follow
3. **Search**: Add search functionality within the component
4. **Real-time Updates**: Update the list when users are followed/unfollowed
5. **User Categories**: Group users by interests or categories
6. **Follow Suggestions**: Show mutual friends or similar interests

## Troubleshooting

### Common Issues

1. **No users displayed**: Ensure the database is seeded with user data
2. **API errors**: Check MongoDB connection and environment variables
3. **Loading issues**: Verify the API endpoint is accessible

### Debugging

- Check browser console for API errors
- Verify MongoDB connection in the seeding script
- Test the API endpoint directly: `GET /api/users?limit=5`

## Dependencies

- React 19
- Next.js 15
- Mongoose (for database operations)
- Tailwind CSS (for styling) 