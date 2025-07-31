import express from "express";
import cors from "cors";
import chatRoutes from "./chats/chats.routes";
import teamRoutes from "./teams/teams.routes";

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/chat', chatRoutes);
app.use('/api/team', teamRoutes);

const PORT = process.env.PORT || 5000;

// Only start the server if this file is run directly (not when imported for testing)
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export {app};