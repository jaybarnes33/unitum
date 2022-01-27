import express from "express";
import { config as dotenv } from "dotenv-flow";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import communityRoutes from "./routes/community";
import postRoutes from "./routes/post";
import morgan from "morgan";
import connectDB from "./config/db";
import helmet from "helmet";
import cors from "cors";
import { redisConnect } from "./config/redis_connect";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { getUser } from "./eventHandlers/token.middleware";
import { Notification } from "./models/Notification";
import { notificationHandler } from "./eventHandlers/notification";
import { chatHandler } from "./eventHandlers/chat";
import searchRouter from "./routes/search";
//dotenv conf
dotenv();

const wrap = (middleware: any) => (socket: Socket, next: any) =>
  middleware(socket.request, {}, next);
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000"
  }
});

io.use(getUser);
io.use(wrap(express.json()));
const onConnection = async (socket: any) => {
  console.log("A user Connected", socket.id);

  socket.join(socket.user._id.toString());
  socket.user.profile.communities.forEach((comm: string) => {
    socket.join(comm.toString());
  });
  console.log(socket.rooms);

  app.use((req: any, res, next) => {
    req.io = io;
    req.socket = socket;
    next();
  });

  const notifications = await Notification.find({
    userID: socket.user._id
  }).select("-__v -updatedAt");

  socket.to(socket.user._id.toString()).emit("Notification:get", notifications);

  notificationHandler(io, socket);
  chatHandler(io, socket);
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
  });
};

io.on("connection", onConnection);

connectDB();
redisConnect();

//Body parser setup
app.use(express.json());

app.use(
  cors({
    origin: "*"
  })
);
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", searchRouter);
//Mount api routes here

httpServer.listen(process.env.PORT, () => {
  console.log(`Backend server running on ${process.env.PORT}`);
});
