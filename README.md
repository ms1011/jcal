# jcal

A CLI tool to manage schedules and to-do lists directly from the terminal.

All schedule data is stored in a `schedule.json` file located in the current working directory where `jcal` commands are executed.

## Installation

To install `jcal` globally, run:

```bash
npm install -g jcal-cli
```

Alternatively, you can use `npx` to run it without global installation:

```bash
npx jcal <command>
```

## Usage

### `jcal init`

Creates an empty `schedule.json` file in the current directory if it doesn't exist.

```bash
jcal init
```

### `jcal add <titles...>`

Adds one or more new schedules. By default, it creates a `todo` type. Use the `-d` or `--detailed` flag to create a `detailed` schedule. When adding multiple detailed schedules, both `--time` and `--content` options are required.

```bash
jcal add "Buy milk"
jcal add "Task A" "Task B" "Task C"
jcal add "Team Meeting" -d --time "Tomorrow 3pm" --content "Discuss Q4 roadmap"
jcal add "Project Review" "Client Call" -d --time "Friday 10am" --content "Prepare presentation"
```

### `jcal list` (or `jcal ls`)

Lists all schedules. By default, it shows only `pending` items. Use `--done` to show only `done` items, or `--all` to show all items. Output is color-coded for better readability:

*   `pending` items: Yellow with a `○` icon.
*   `done` items: Gray with a `✔` icon and strikethrough.
*   `todo` type: Cyan.
*   `detailed` type: Magenta.

```bash
jcal ls
jcal ls --done
jcal ls --all
```

### `jcal done <id>`

Marks the schedule with the given `<id>` as `done`.

```bash
jcal done a3b8c1f9
```

### `jcal remove <id>` (or `jcal rm`)

Deletes the schedule with the given `<id>`. The command will confirm the removal by displaying the title and ID of the deleted schedule.

```bash
jcal rm a3b8c1f9
```

### `jcal update <id>`

Updates an existing schedule. Use options to specify what to change (`--title`, `--time`, `--content`).

```bash
jcal update a3b8c1f9 --title "Buy almond milk"
```