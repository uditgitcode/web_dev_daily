# Student Management REST API

A simple RESTful API built with Node.js and Express to perform CRUD operations
on student records, stored in memory as a JavaScript array (no database).

## Project Structure

```
student-management-api/
├── app.js                 # Server setup, middleware, error handlers
├── routes/
│   └── studentRoutes.js   # Modular router: all /students endpoints
├── middleware/
│   └── logger.js          # Custom logger middleware (method, URL, timestamp)
├── data/
│   └── students.js        # In-memory student array (acts as the "database")
├── package.json
└── README.md
```

## Setup & Run

```bash
npm install
npm start
```

The server starts at **http://localhost:3000**

## API Endpoints

| Method | Endpoint          | Description              | Success Status |
|--------|-------------------|--------------------------|-----------------|
| GET    | /students         | Get all students         | 200             |
| GET    | /students/:id     | Get a single student     | 200 / 404       |
| POST   | /students         | Create a new student     | 201 / 400       |
| PUT    | /students/:id     | Update a student         | 200 / 400 / 404 |
| DELETE | /students/:id     | Delete a student         | 200 / 404       |

### Sample request bodies (POST / PUT)

```json
{
  "name": "Sneha",
  "course": "MCA",
  "age": 22
}
```

`name` and `course` are required for POST. For PUT, at least one of
`name`, `course`, or `age` must be provided.

## Error Handling

- **400 Bad Request** — invalid/missing input (e.g. missing `name`/`course`, non-numeric `id`)
- **404 Not Found** — student id doesn't exist, or route doesn't exist
- **500 Internal Server Error** — unexpected server errors (global error handler in app.js)

## Testing with Postman

1. Open Postman and create a new Collection called `Student Management API`.
2. Add requests for each endpoint above, pointing at `http://localhost:3000`.
3. For POST/PUT, go to **Body → raw → JSON** and enter the sample body above.
4. Send each request and confirm the status code and JSON response.
5. Check your terminal — the custom logger middleware prints every request
   (method, URL, timestamp) as it comes in.

## Notes

- Data resets every time the server restarts (in-memory only, per assignment restrictions).
- No MongoDB, MySQL, or Mongoose is used — only a plain JS array + JSON responses.
