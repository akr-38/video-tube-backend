# VideoTube Backend

The backend service for the VideoTube application, a video-sharing platform built using Node.js, Express.js, and MongoDB. This backend handles user authentication, video management, user interactions, and playlist functionalities.

## Features

- 📹 Video upload, update, and delete functionality
- 🔒 User authentication and authorization (JWT-based)
- 👍 Like and dislike videos, comments, and tweets
- 💬 Comment on videos and manage comments
- 📂 Video categorization and search
- 📑 Playlist management (create, update, delete, add/remove videos)
- 📡 Subscription management (subscribe/unsubscribe to channels)
- 📝 Tweet system (create, update, delete tweets)
- 🚀 Optimized API performance

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **File Storage**: Cloudinary (or local storage)
- **Environment Variables Management**: dotenv

## Installation

### Prerequisites
Ensure you have the following installed:
- Node.js
- MongoDB (local or cloud)

### Steps to Run the Project

#### 1. Clone the repository
```sh
git clone https://github.com/akr-38/video-tube-backend.git
cd video-tube-backend
```

#### 2. Install dependencies
```sh
npm install
```

#### 3. Set up environment variables
Create a `.env` file in the root directory and configure the necessary variables:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
PORT=5000
```

#### 4. Run the project
```sh
npm start
```

The backend will be running at `http://localhost:5000`.

## API Endpoints

### Authentication
| Method | Endpoint                   | Description                          |
|--------|----------------------------|--------------------------------------|
| POST   | /api/auth/register         | Register a new user                 |
| POST   | /api/auth/login            | User login                          |
| POST   | /api/auth/logout           | Logout user (JWT required)          |
| POST   | /api/auth/refresh-tokens   | Refresh JWT tokens                  |
| POST   | /api/auth/change-password  | Change user password (JWT required) |
| GET    | /api/auth/get-current-user | Fetch logged-in user details        |
| PATCH  | /api/auth/update-account-details | Update user account details |
| PATCH  | /api/auth/update-avatar    | Update user avatar                  |
| PATCH  | /api/auth/update-cover-image | Update user cover image           |

### Videos
| Method | Endpoint                      | Description                     |
|--------|--------------------------------|---------------------------------|
| GET    | /api/videos                    | Get all videos                  |
| POST   | /api/videos                    | Upload a new video              |
| GET    | /api/videos/:videoId           | Get video by ID                 |
| PATCH  | /api/videos/:videoId           | Update video details            |
| DELETE | /api/videos/:videoId           | Delete a video                  |
| PATCH  | /api/videos/toggle/publish/:videoId | Toggle video publish status |

### Video Interactions
| Method | Endpoint                          | Description             |
|--------|----------------------------------|-------------------------|
| POST   | /api/videos/:videoId/like       | Like a video           |
| POST   | /api/videos/:videoId/dislike    | Dislike a video        |
| GET    | /api/liked/videos               | Get liked videos       |

### Comments
| Method | Endpoint                    | Description                    |
|--------|----------------------------|--------------------------------|
| GET    | /api/comments/:videoId     | Get comments for a video      |
| POST   | /api/comments/:videoId     | Add a comment to a video      |
| PATCH  | /api/comments/c/:commentId | Update a comment              |
| DELETE | /api/comments/c/:commentId | Delete a comment              |
| POST   | /api/comments/toggle/c/:commentId | Like/Dislike a comment |

### Playlists
| Method | Endpoint                           | Description                   |
|--------|-----------------------------------|-------------------------------|
| POST   | /api/playlists                   | Create a playlist             |
| GET    | /api/playlists/:playlistId       | Get playlist by ID            |
| PATCH  | /api/playlists/:playlistId       | Update a playlist             |
| DELETE | /api/playlists/:playlistId       | Delete a playlist             |
| PATCH  | /api/playlists/add/:videoId/:playlistId | Add video to playlist |
| PATCH  | /api/playlists/remove/:videoId/:playlistId | Remove video from playlist |
| GET    | /api/playlists/user/:userId      | Get user’s playlists          |

### Subscriptions
| Method | Endpoint                      | Description                        |
|--------|------------------------------|------------------------------------|
| GET    | /api/subscriptions/c/:channelId | Get subscribed channels         |
| POST   | /api/subscriptions/c/:channelId | Subscribe/Unsubscribe a channel |
| GET    | /api/subscriptions/u/:subscriberId | Get channel subscribers      |

### Tweets
| Method | Endpoint                     | Description            |
|--------|-----------------------------|------------------------|
| POST   | /api/tweets                 | Create a tweet        |
| GET    | /api/tweets/user/:userId    | Get user's tweets     |
| PATCH  | /api/tweets/:tweetId        | Update a tweet        |
| DELETE | /api/tweets/:tweetId        | Delete a tweet        |
| POST   | /api/tweets/toggle/t/:tweetId | Like/Dislike a tweet |

## Contributing
Feel free to fork this repository and contribute by submitting pull requests.

## License
This project is licensed under the MIT License.

## Contact
For any queries, feel free to reach out:
- GitHub: [akr-38](https://github.com/akr-38)
- Email: your-email@example.com

