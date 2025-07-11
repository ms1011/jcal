
You are an expert Node.js developer specializing in creating command-line interface (CLI) tools.**

I want you to create a complete CLI tool named `jcal`. This tool will allow users to manage their schedules and to-do lists directly from the terminal. All data must be stored in a single `schedule.json` file in the user's current working directory.

Please follow these detailed specifications precisely.

#### **1. Core Requirements**

*   **Project Name:** `jcal`
*   **Language/Platform:** Node.js
*   **Core Functionality:** Create, Read, Update, and Delete (CRUD) schedules.
*   **Data Storage:** A single `schedule.json` file.
*   **Schedule Types:** Support two distinct types of entries:
    1.  **Todo:** A simple task with a title and a status (`pending`/`done`).
    2.  **Detailed:** A full schedule entry with a title, content, specific date/time, and status.
*   **Distribution:** The final tool must be executable via `npx` and installable globally via `npm install -g`.
*   **User Experience:** The CLI should be intuitive, with clear commands and user-friendly, color-coded output.

#### **2. Technology Stack**

You must use the following Node.js libraries:
*   `commander`: For parsing commands, arguments, and options.
*   `inquirer`: For interactive prompts when required information is not provided via options.
*   `chalk`: For styling and coloring the terminal output to improve readability.
*   `dayjs`: For parsing and formatting dates and times.
*   `uuid`: To generate a unique ID for each schedule item.

#### **3. Data Structure (`schedule.json`)**

The `schedule.json` file will contain a single root object with a `schedules` array. Each object in the array represents a single schedule item. Use this exact structure:

```json
{
  "schedules": [
    {
      "id": "string (short UUID)",
      "type": "detailed | todo",
      "title": "string",
      "status": "pending | done",
      "createdAt": "string (ISO 8601 format)",
      // Fields only for 'detailed' type
      "content": "string",
      "dateTime": "string (User-provided date/time)"
    }
  ]
}
```

#### **4. CLI Command Specifications**

Implement the following commands:

| Command | Alias | Description & Logic | Example Usage |
| :--- | :--- | :--- | :--- |
| `jcal init` | | Creates an empty `schedule.json` file in the current directory if it doesn't exist. | `jcal init` |
| `jcal add <title>` | | Adds a new schedule. <br>- **Default:** Creates a `todo` type. <br>- **With `-d, --detail` flag:** Creates a `detailed` schedule. <br>- If `detailed`, and `--time` or `--content` are missing, use `inquirer` to ask the user for them. | `jcal add "Buy milk"` <br> `jcal add "Team Meeting" -d --time "Tomorrow 3pm" --content "Discuss Q4 roadmap"` |
| `jcal list` | `ls` | Lists all schedules. <br>- **Default:** Show only `pending` items. <br>- **`--done`:** Show only `done` items. <br>- **`--all`:** Show all items. <br>- Use `chalk` for styling: `pending` items are yellow, `done` items are gray and strikethrough. Distinguish between `todo` and `detailed` types in the output. | `jcal ls` <br> `jcal ls --done` |
| `jcal done <id>` | | Marks the schedule with the given `<id>` as `done`. | `jcal done a3b8c1f9` |
| `jcal remove <id>` | `rm` | Deletes the schedule with the given `<id>`. | `jcal rm a3b8c1f9` |
| `jcal update <id>` | | Updates an existing schedule. Use options to specify what to change (`--title`, `--time`, `--content`). | `jcal update a3b8c1f9 --title "Buy almond milk"` |

---

#### **5. Implementation Steps & Code Style**

Please generate the code in the following sequence.

**Step 1: `package.json` File**
First, provide the complete content for the `package.json` file. Ensure it includes:
*   `"type": "module"` to use ES Modules (`import/export`).
*   The `bin` field to map the `jcal` command to the main script.
*   All the required dependencies (`commander`, `inquirer`, etc.).

**Step 2: Main `index.js` File**
Next, provide the complete code for `index.js`. Please adhere to these guidelines:
1.  **Shebang:** Start the file with `#!/usr/bin/env node`.
2.  **Imports:** Import all necessary libraries at the top.
3.  **File I/O Helpers:** Create two `async` helper functions:
    *   `readDB()`: Reads `schedule.json`. If the file doesn't exist, it should gracefully return the default empty structure (`{ "schedules": [] }`) instead of throwing an error.
    *   `writeDB(data)`: Writes the provided data object to `schedule.json`.
4.  **Commander Setup:** Initialize `commander` and set up the program name, description, and version.
5.  **Command Implementation:** Implement each command (`init`, `add`, `list`, etc.) as defined in the table above.
    *   Use `async/await` for all file operations and `inquirer` prompts.
    *   Use `chalk` extensively in the `list` command for a rich user experience.
    *   For `add`, generate a short, 8-character UUID for the `id`.
    *   Provide clear success and error messages to the user (e.g., "✅ Schedule added!", "❌ Error: Schedule with that ID not found.").
6.  **Code Clarity:** Use clear variable names and add comments where the logic is complex.

**Let's begin. Please provide the content for `package.json` first.**
