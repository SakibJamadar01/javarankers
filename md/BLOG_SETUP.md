# Blog System Setup

## Database Setup

Run the SQL script to create the blogs table and add sample content:

```bash
mysql -u your_username -p your_database < create_blogs_table.sql
```

Or execute the SQL manually in your MySQL client.

## Features Added

### 1. Database Schema
- `blogs` table with fields: id, title, content, author, slug, published, created_at, updated_at
- Sample blog posts about Java programming

### 2. API Routes (`/api/blogs`)
- `GET /` - Get all published blogs
- `GET /:slug` - Get single blog by slug
- `GET /admin/all` - Get all blogs (admin only)
- `POST /admin` - Create new blog (admin only)
- `PUT /admin/:id` - Update blog (admin only)
- `DELETE /admin/:id` - Delete blog (admin only)

### 3. Frontend Pages
- `/blogs` - Blog listing page
- `/blogs/:slug` - Individual blog post page

### 4. Admin Features
- Blog management section in admin panel
- Create, edit, delete blogs
- Toggle published status
- Rich content support

### 5. Navigation
- Added "Blogs" link to footer navigation

## Usage

1. **Admin Access**: Go to `/admin` and login with admin credentials
2. **Create Blogs**: Use the Blog Management section to create new posts
3. **View Blogs**: Visit `/blogs` to see published blog posts
4. **Read Posts**: Click on any blog title to read the full post

## Content Features

- Markdown-like formatting support
- Code syntax highlighting for Java
- Author attribution
- Publication date display
- Draft/Published status

The system includes 3 sample blog posts about Java programming fundamentals to get you started.