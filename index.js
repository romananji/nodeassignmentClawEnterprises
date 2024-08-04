const express=require("express")
const app=express();
const {open}=require("sqlite")
const sqlite3=require("sqlite3")
const path=require("path")
const bcrypt=require("bcrypt")
app.use(express.json());
const jwt=require("jsonwebtoken");
const dbPath=path.join(__dirname,"databaseData.db");
let db=null;
const initializeDBAndServer=async ()=>{
    try{
        db=await open({
            filename:dbPath,
            driver:sqlite3.Database
        })
        app.listen(3000,()=>{
            console.log("app is running on the server");
        })
    }catch(e){
        console.log(`DB Error:${e.message}`)
        process.exit(1)
    }
}
initializeDBAndServer()
const authenticateToken=(request,response,next)=>{
    let jwtToken="";
    const authHeader=request.headers['authorization'];
    if (authHeader!==undefined){
        jwtToken=authHeader.split(" ")[1]
    }
    if (jwtToken===undefined){
        response.status(401)
        response.send("Access Token needed")
    }else{
        jwt.verify(jwtToken,"jwt_token",async (error,user)=>{
            if (error){
                response.status(401)
                response.send("Invalid Access Token")
            }else{
                request.user=user
                next()
            }
        })
    }
}
app.post("/register/",async (request,response)=>{
    const {id,username,password}=request.body 
    const getUserQuery=`
        SELECT * FROM user WHERE username='${username}';
    `;
    const dbUser=await db.get(getUserQuery);
    if (dbUser!==undefined){
        response.status(400)
        response.send("User already exists");
    }else{
        const hashedPassword=await bcrypt.hash(password,10);
        const postQuery=`
            INSERT INTO user 
                (id,username,password)
            VALUES 
                (${id},'${username}','${hashedPassword}');
        `;
        await db.run(postQuery); 
        response.status(201);
        response.send("User Created")
    }
})
app.post("/login",async (request,response)=>{
    const {username,password}=request.body; 
    const getUserQuery=`
        SELECT * FROM user WHERE username='${username}';
    `;
    const dbUser=await db.get(getUserQuery); 
    if (dbUser===undefined){
        response.status(400)
        response.send("Invalid user")
    }else{
        const isPasswordCorrect=await bcrypt.compare(password,dbUser.password)
        if (isPasswordCorrect===true){
            const payload={username:username,id:dbUser.id}
            const jwtToken=jwt.sign(payload,"jwt_token");
            response.send(jwtToken)
        }else{
            response.status(400);
            response.send("Invalid password")
        }
    }
})
app.post("/todos/",authenticateToken,async (request,response)=>{
    const {id,user_id,description,status}=request.body 
    const {user}=request 
    if (user.id===user_id){
        createTodoQuery=`
            INSERT INTO to_do
                (id,user_id,description,status)
            VALUES 
                (${id},${user_id},'${description}','${status}');
        `;
        await db.run(createTodoQuery);
        response.send("Todo created")
    }else{
        response.status(400)
        response.send("Access denied")
    }
})
app.get("/todos/",authenticateToken,async (request,response)=>{
    const {user}=request
    const userTodosQuery=`
        SELECT * 
        FROM 
            to_do 
        WHERE user_id=${user.id};
    `;
    const userTodos=await db.all(userTodosQuery);
    response.send(userTodos);
})
app.put("/todos/:todoId/",authenticateToken,async (request,response)=>{
    const {todoId}=request.params; 
    const {user}=request;
    const {user_id,description,status}=request.body; 
    if (user.id===user_id){
        const updateQuery=`
            UPDATE to_do
                SET
                    user_id=${user_id},
                    description='${description}',
                    status='${status}'
                WHERE 
                    id=${todoId};
        `;
        await db.run(updateQuery);
        response.send("Todo updated")
    }else{
        response.status(400)
        response.send("Acess denied")
    }
})
app.delete("/todos/:todoId/",authenticateToken,async (request,response)=>{
    const {user}=request 
    const {todoId}=request.params; 
    const getUser=`
        SELECT * FROM to_do WHERE  id=${todoId};
    `
    const todoUser=await db.get(getUser); 
    if (todoUser.user_id===user.id){
        const deleteTodoQuery=`
            DELETE FROM to_do WHERE id=${todoId};
        `;
        await db.run(deleteTodoQuery);
        response.send("Todo Deleted");
    }else{
        response.status(400);
        response.send("Access denied")
    }
})
module.exports=app