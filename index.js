import express from 'express';
import fs from 'fs';
import readline from 'readline';
import cors from 'cors';
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON data

// Function to read a file line by line
async function readFileLines(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let lines = [];
    for await (const line of rl) {
        lines.push(line);
    }
    return lines;
}

// API: Get all lines from a file
app.get("/get-lines/:fileName", async (req, res) => {
    const fileName = req.params.fileName+".txt";
    const filePath = `./${fileName}`;

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
    }

    try {
        const lines = await readFileLines(filePath);
        res.json({ lines });
    } catch (error) {
        res.status(500).json({ error: "Error reading file" });
    }
});





// API: Append a new line to a file
app.post("/add-line/:fileName", (req, res) => {
    const fileName = req.params.fileName+".txt";
    const filePath = `./${fileName}`;
    const newLine = req.body.newLine; // Get user input from request body

    if (!newLine) {
        return res.status(400).json({ error: "No content provided" });
    }

    // Append the new line to the file
    fs.appendFile(filePath, `\n${newLine}`, "utf8", (err) => {
        if (err) {
            return res.status(500).json({ error: "Error writing to file" });
        }
        res.json({ message: "Line added successfully", addedLine: newLine });
    });
});


// API: Delete a specific line from a file
app.delete("/delete-line/:fileName/:lineNumber", async (req, res) => {
    const fileName = req.params.fileName+".txt";
    const lineNumber = parseInt(req.params.lineNumber);
    const filePath = `./${fileName}`;

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
    }

    try {
        let lines = await readFileLines(filePath);

        if (lineNumber < 1 || lineNumber > lines.length) {
            return res.status(400).json({ error: "Invalid line number" });
        }

        // Remove the specific line
        lines.splice(lineNumber - 1, 1);

        // Write updated lines back to file
        fs.writeFileSync(filePath, lines.join("\n"), "utf8");

        res.json({ message: "Line deleted successfully", updatedLines: lines });
    } catch (error) {
        res.status(500).json({ error: "Error modifying file" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
