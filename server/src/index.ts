import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.json({ message: "Todo API is running" });
});

app.listen(port, "0.0.0.0", () => {
	console.log(`Todo API listening at http://0.0.0.0:${port}`);
});
