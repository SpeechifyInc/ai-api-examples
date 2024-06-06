import express from "express";

const app = express();

app.get("/", (req, res) => {
	res.send("Hello World!");
});

const port = Number.parseInt(process.env.PORT || 4040);
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
