This documentation provides an overview of the API endpoints for a To-Do List application. The backend is implemented using Node.js with an SQLite database, and JWT (JSON Web Token) is used for authentication. 
__Endpoints__ 
    **/POST /register/**
    Requests a new user 
    Request body:
        {
        "id": "integer",
        "username": "string",
        "password": "string"
        } 
    Response:
        `201 created`: User created successfully 
        `400 bad request`: User already exists 
    Example Request:
        {
        "id": 1,
        "username": "anji",
        "password": "anji@123"
        }
    Example Response:
        {
        "message": "User Created"
        }
    **POST /login/** 
    Logs in a user and returns a JWT token. 
    Request body:
        {
        "username": "string",
        "password": "string"
        }

    Response:
        `200 ok`: Returns the JWT Token.
        `400 bad request`: Invalid username or password
    Example Request:
        {
        "username": "anji",
        "password": "anji@123"
        }
    Example Response:
        {
        "message": "User Created"
        }

__CREATE TODO__    
**POST /todos/** 
    Creates a new to-do item.
    Headers:
    `Authorization`: Bearer "jwt_token" 
    Request Body: 
    {
    "id": "integer",
    "user_id": "integer",
    "description": "string",
    "status": "string"
    }
    Reponse :
    `200 OK`: To-do created successfully.
    `400 Bad Request`: Access denied.
    Example Request:
        {
    "id": 1,
    "user_id": 1,
    "description": "Learn Python",
    "status": "TO DO"
    }
    Example Response:
    {
    "message": "Todo created"
    }

__GET ALL TODOS__ 
    **GET /todos/** 
    Fetches all to-do items for the authenticated user.
    Headers:
        Authoriztion: Bearer "JWT Token"; 
    Response:
        `200 ok`: Returns the list of todos 
    Example Response:
    [
        {
            "id": 1,
            "user_id": 1,
            "description": "Learn Python",
            "status": "To Do"
        },
        {
            "id": 2,
            "user_id": 1,
            "description": "Learn NodeJS",
            "status": "DONE"
        }
    ]
__UPDATE TO_DO__ 
    **PUT /todos/** 
    Headers:
    Authorization: Bearer "JWT Token" 
    Request Params:
        `todoId`: the Id of the to-do item 
    Request Body:
        {
        "user_id": "integer",
        "description": "string",
        "status": "string"
        }
    Response:
        `200 ok`: to_do updated successfully 
        `400 bad request`: Access denied 
    Example Request:
        {
        "user_id": 1,
        "description": "Buy groceries and fruits",
        "status": "IN PROGRESS"
        }
    Example Response:
    {
    "message": "Todo updated"
    }
__DELETE TO_DO__ 
    **DELETE /todos/** 
    Deletes an existing to-do item. 
    Headers:
      `Authorization`: Bearer "JWT Token"
    Request Params:
        `todoId`: The ID of the to-do item.
    Response:
    `200 OK`: To-do deleted successfully.
    `400 Bad Request`: Access denied. 
    Example Response:
        {
    "message": "Todo Deleted"
    }

__Authentication Middleware__ 
The `authenticateToken` middleware checks for the presence of a valid JWT in the `Authorization` header. If the token is valid, the user information is added to the request object; otherwise, a 401 Unauthorized response is sent. 

    Include JWT Token in Authorization Header like:- 
        `Authorization` : Bearer <jwt_token>
