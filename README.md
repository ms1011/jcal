# jcal

A CLI tool to manage schedules and to-do lists directly from the terminal.

## Installation

To install `jcal` globally, run:

```bash
npm install -g jcal
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

### `jcal add <title>`

Adds a new schedule. By default, it creates a `todo` type. Use the `-d` or `--detailed` flag to create a `detailed` schedule. If `detailed`, and `--time` or `--content` are missing, it will prompt you for them.

```bash
jcal add "Buy milk"
jcal add "Team Meeting" -d --time "Tomorrow 3pm" --content "Discuss Q4 roadmap"
```

### `jcal list` (or `jcal ls`)

Lists all schedules. By default, it shows only `pending` items. Use `--done` to show only `done` items, or `--all` to show all items.

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

Deletes the schedule with the given `<id>`.

```bash
jcal rm a3b8c1f9
```

### `jcal update <id>`

Updates an existing schedule. Use options to specify what to change (`--title`, `--time`, `--content`).

```bash
jcal update a3b8c1f9 --title "Buy almond milk"
```
